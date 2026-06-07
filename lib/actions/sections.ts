'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ActionState } from '@/lib/types'

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

export async function createSection(
  productTypeId: string,
  manufacturerId: string,
  name: string
): Promise<ActionState> {
  await requireAdmin()
  if (!name?.trim()) return { message: 'Name ist erforderlich' }

  const { data: last } = await supabaseAdmin
    .from('download_sections')
    .select('sort_order')
    .eq('product_type_id', productTypeId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabaseAdmin.from('download_sections').insert({
    product_type_id: productTypeId,
    name: name.trim(),
    sort_order: (last?.sort_order ?? -1) + 1,
  })

  if (error) return { message: 'Fehler: ' + error.message }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}

export async function updateSection(
  id: string,
  productTypeId: string,
  manufacturerId: string,
  name: string
): Promise<ActionState> {
  await requireAdmin()
  if (!name?.trim()) return { message: 'Name ist erforderlich' }

  const { error } = await supabaseAdmin
    .from('download_sections')
    .update({ name: name.trim() })
    .eq('id', id)

  if (error) return { message: 'Fehler: ' + error.message }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}

export async function deleteSection(
  id: string,
  productTypeId: string,
  manufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const { error } = await supabaseAdmin
    .from('download_sections')
    .delete()
    .eq('id', id)

  if (error) return { message: 'Fehler: ' + error.message }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}

export async function reorderSections(
  ids: string[],
  productTypeId: string,
  manufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const results = await Promise.all(
    ids.map((id, i) =>
      supabaseAdmin.from('download_sections').update({ sort_order: i }).eq('id', id)
    )
  )

  if (results.some((r) => r.error)) return { message: 'Fehler beim Sortieren' }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}
