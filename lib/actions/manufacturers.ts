'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { ActionState } from '@/lib/types'

const ManufacturerSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(100),
  category: z.enum(['alufefa', 'partner', 'sonstige'], {
    message: 'Kategorie auswählen',
  }),
  image_url: z.string().url('Ungültige Bild-URL').optional().or(z.literal('')),
})

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await currentUser()
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
  if (!isAdmin) redirect('/')
}

export async function createManufacturer(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    image_url: formData.get('image_url') as string,
  }

  const result = ManufacturerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const slug = slugify(result.data.name)

  const { error } = await supabaseAdmin.from('manufacturers').insert({
    name: result.data.name,
    slug,
    category: result.data.category,
    image_url: result.data.image_url || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { errors: { name: ['Ein Hersteller mit diesem Namen existiert bereits'] } }
    }
    return { message: 'Fehler beim Speichern: ' + error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/manufacturers')
  redirect('/admin/manufacturers')
}

export async function updateManufacturer(
  id: string,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const raw = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    image_url: formData.get('image_url') as string,
  }

  const result = ManufacturerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const { data: existing } = await supabaseAdmin
    .from('manufacturers')
    .select('slug')
    .eq('id', id)
    .single()

  const slug = existing?.slug ?? slugify(result.data.name)

  const { error } = await supabaseAdmin
    .from('manufacturers')
    .update({
      name: result.data.name,
      slug,
      category: result.data.category,
      image_url: result.data.image_url || null,
    })
    .eq('id', id)

  if (error) return { message: 'Fehler beim Speichern: ' + error.message }

  revalidatePath('/')
  revalidatePath('/admin/manufacturers')
  revalidatePath(`/admin/manufacturers/${id}`)
  return { success: true, message: 'Hersteller gespeichert' }
}

export async function deleteManufacturer(id: string): Promise<ActionState> {
  await requireAdmin()

  const { error } = await supabaseAdmin.from('manufacturers').delete().eq('id', id)
  if (error) return { message: 'Fehler beim Löschen: ' + error.message }

  revalidatePath('/')
  revalidatePath('/admin/manufacturers')
  redirect('/admin/manufacturers')
}
