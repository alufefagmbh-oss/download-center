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

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value ?? null
}

export async function saveSettings(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const notificationEmail = formData.get('notification_email') as string

  const { error } = await supabaseAdmin.from('settings').upsert(
    { key: 'notification_email', value: notificationEmail ?? '' },
    { onConflict: 'key' }
  )

  if (error) return { message: 'Fehler beim Speichern: ' + error.message }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Einstellungen gespeichert' }
}
