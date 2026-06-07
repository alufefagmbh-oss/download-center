'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import type { ActionState } from '@/lib/types'

const DownloadSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(200),
  file_url: z.string().url('Datei-URL ist erforderlich'),
  original_filename: z.string().default(''),
  file_type: z.string().min(1, 'Dateityp ist erforderlich'),
  file_size: z.string().min(1, 'Dateigröße ist erforderlich'),
  version: z.string().min(1, 'Version ist erforderlich').max(50),
})

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await currentUser()
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
  if (!isAdmin) redirect('/')
}

function revalidate(manufacturerId: string, productTypeId: string) {
  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
}

export async function createDownload(
  productTypeId: string,
  manufacturerId: string,
  groupId: string | null,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    file_url: formData.get('file_url') as string,
    original_filename: (formData.get('original_filename') as string) || '',
    file_type: formData.get('file_type') as string,
    file_size: formData.get('file_size') as string,
    version: formData.get('version') as string,
  }

  const result = DownloadSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  // Get next sort_order within the group (or standalone)
  const orderQuery = supabaseAdmin
    .from('downloads')
    .select('sort_order')
    .eq('product_type_id', productTypeId)
    .order('sort_order', { ascending: false })
    .limit(1)

  if (groupId) {
    orderQuery.eq('group_id', groupId)
  } else {
    orderQuery.is('group_id', null)
  }

  const { data: last } = await orderQuery.maybeSingle()

  const { error } = await supabaseAdmin.from('downloads').insert({
    product_type_id: productTypeId,
    group_id: groupId,
    sort_order: (last?.sort_order ?? -1) + 1,
    ...result.data,
  })

  if (error) return { message: 'Fehler beim Speichern: ' + error.message }

  revalidate(manufacturerId, productTypeId)
  redirect(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
}

export async function updateDownload(
  id: string,
  productTypeId: string,
  manufacturerId: string,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    file_url: formData.get('file_url') as string,
    original_filename: (formData.get('original_filename') as string) || '',
    file_type: formData.get('file_type') as string,
    file_size: formData.get('file_size') as string,
    version: formData.get('version') as string,
  }

  const result = DownloadSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const { error } = await supabaseAdmin
    .from('downloads')
    .update(result.data)
    .eq('id', id)

  if (error) return { message: 'Fehler beim Speichern: ' + error.message }

  revalidate(manufacturerId, productTypeId)
  return { success: true, message: 'Download gespeichert' }
}

export async function deleteDownload(
  id: string,
  productTypeId: string,
  manufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const { error } = await supabaseAdmin.from('downloads').delete().eq('id', id)
  if (error) return { message: 'Fehler beim Löschen: ' + error.message }

  revalidate(manufacturerId, productTypeId)
  redirect(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
}

export async function reorderDownloads(
  ids: string[],
  productTypeId: string,
  manufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const results = await Promise.all(
    ids.map((id, i) =>
      supabaseAdmin.from('downloads').update({ sort_order: i }).eq('id', id)
    )
  )

  if (results.some((r) => r.error)) return { message: 'Fehler beim Sortieren' }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}
