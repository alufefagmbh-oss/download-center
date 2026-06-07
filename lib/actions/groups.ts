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

export async function createGroup(
  productTypeId: string,
  manufacturerId: string,
  name: string,
  sectionId: string | null
): Promise<ActionState> {
  await requireAdmin()
  if (!name?.trim()) return { message: 'Name ist erforderlich' }

  const query = supabaseAdmin
    .from('download_groups')
    .select('sort_order')
    .eq('product_type_id', productTypeId)
    .order('sort_order', { ascending: false })
    .limit(1)

  if (sectionId) {
    query.eq('section_id', sectionId)
  } else {
    query.is('section_id', null)
  }

  const { data: last } = await query.maybeSingle()

  const { error } = await supabaseAdmin.from('download_groups').insert({
    product_type_id: productTypeId,
    section_id: sectionId,
    name: name.trim(),
    sort_order: (last?.sort_order ?? -1) + 1,
  })

  if (error) return { message: 'Fehler: ' + error.message }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}

export async function updateGroup(
  id: string,
  productTypeId: string,
  manufacturerId: string,
  name: string
): Promise<ActionState> {
  await requireAdmin()
  if (!name?.trim()) return { message: 'Name ist erforderlich' }

  const { error } = await supabaseAdmin
    .from('download_groups')
    .update({ name: name.trim() })
    .eq('id', id)

  if (error) return { message: 'Fehler: ' + error.message }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}

export async function deleteGroup(
  id: string,
  productTypeId: string,
  manufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const { error } = await supabaseAdmin
    .from('download_groups')
    .delete()
    .eq('id', id)

  if (error) return { message: 'Fehler: ' + error.message }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}

export async function reorderGroups(
  ids: string[],
  productTypeId: string,
  manufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const results = await Promise.all(
    ids.map((id, i) =>
      supabaseAdmin.from('download_groups').update({ sort_order: i }).eq('id', id)
    )
  )

  if (results.some((r) => r.error)) return { message: 'Fehler beim Sortieren' }
  revalidate(manufacturerId, productTypeId)
  return { success: true }
}
