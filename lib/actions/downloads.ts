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

export async function createDownload(
  productTypeId: string,
  manufacturerId: string,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    file_url: formData.get('file_url') as string,
    file_type: formData.get('file_type') as string,
    file_size: formData.get('file_size') as string,
    version: formData.get('version') as string,
  }

  const result = DownloadSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const { error } = await supabaseAdmin.from('downloads').insert({
    product_type_id: productTypeId,
    ...result.data,
  })

  if (error) return { message: 'Fehler beim Speichern: ' + error.message }

  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
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

  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
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

  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
  redirect(`/admin/manufacturers/${manufacturerId}/products/${productTypeId}`)
}

export async function logAndGetDownloadUrl(downloadId: string): Promise<{ url?: string; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Nicht angemeldet' }

  const [user, { data: download, error: fetchError }] = await Promise.all([
    currentUser(),
    supabaseAdmin
      .from('downloads')
      .select('*, product_type:product_types(name, manufacturer:manufacturers(name))')
      .eq('id', downloadId)
      .single(),
  ])

  if (fetchError || !download) return { error: 'Datei nicht gefunden' }

  const productType = download.product_type as { name: string; manufacturer: { name: string } } | null
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  await supabaseAdmin.from('download_logs').insert({
    user_id: userId,
    user_email: email,
    download_id: downloadId,
    download_name: download.name,
    manufacturer_name: productType?.manufacturer?.name ?? '',
    product_name: productType?.name ?? '',
  })

  return { url: download.file_url }
}
