'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { ActionState } from '@/lib/types'

const ProductSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(100),
  image_url: z.string().url('Ungültige Bild-URL').optional().or(z.literal('')),
})

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await currentUser()
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
  if (!isAdmin) redirect('/')
}

export async function createProduct(
  manufacturerId: string,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    image_url: formData.get('image_url') as string,
  }

  const result = ProductSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const slug = slugify(result.data.name)

  const { error } = await supabaseAdmin.from('product_types').insert({
    manufacturer_id: manufacturerId,
    name: result.data.name,
    slug,
    image_url: result.data.image_url || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { errors: { name: ['Ein Produkt mit diesem Namen existiert bereits'] } }
    }
    return { message: 'Fehler beim Speichern: ' + error.message }
  }

  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}`)
  redirect(`/admin/manufacturers/${manufacturerId}`)
}

export async function updateProduct(
  id: string,
  manufacturerId: string,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    image_url: formData.get('image_url') as string,
  }

  const result = ProductSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const { data: existing } = await supabaseAdmin
    .from('product_types')
    .select('slug')
    .eq('id', id)
    .single()

  const slug = existing?.slug ?? slugify(result.data.name)

  const { error } = await supabaseAdmin
    .from('product_types')
    .update({
      name: result.data.name,
      slug,
      image_url: result.data.image_url || null,
    })
    .eq('id', id)

  if (error) return { message: 'Fehler beim Speichern: ' + error.message }

  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}`)
  revalidatePath(`/admin/manufacturers/${manufacturerId}/products/${id}`)
  return { success: true, message: 'Produkt gespeichert' }
}

export async function deleteProduct(id: string, manufacturerId: string): Promise<ActionState> {
  await requireAdmin()

  const { error } = await supabaseAdmin.from('product_types').delete().eq('id', id)
  if (error) return { message: 'Fehler beim Löschen: ' + error.message }

  revalidatePath('/')
  revalidatePath(`/admin/manufacturers/${manufacturerId}`)
  redirect(`/admin/manufacturers/${manufacturerId}`)
}

export async function moveProduct(
  productId: string,
  newManufacturerId: string
): Promise<ActionState> {
  await requireAdmin()

  const { error } = await supabaseAdmin
    .from('product_types')
    .update({ manufacturer_id: newManufacturerId })
    .eq('id', productId)

  if (error) return { message: 'Fehler beim Verschieben: ' + error.message }

  revalidatePath('/')
  revalidatePath('/admin/products')
  return { success: true }
}
