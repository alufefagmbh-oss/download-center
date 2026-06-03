'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import type { ActionState } from '@/lib/types'
import { sendOnboardingNotification } from '@/lib/email'

const OnboardingSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  firma: z.string().min(1, 'Firma ist erforderlich'),
  position: z.string().min(1, 'Position ist erforderlich'),
  uid: z.string().optional(),
  telefon: z.string().optional(),
})

export async function completeOnboarding(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const raw = {
    name: formData.get('name') as string,
    firma: formData.get('firma') as string,
    position: formData.get('position') as string,
    uid: (formData.get('uid') as string) || undefined,
    telefon: (formData.get('telefon') as string) || undefined,
  }

  const result = OnboardingSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboardingComplete: true },
    privateMetadata: {
      name: result.data.name,
      firma: result.data.firma,
      position: result.data.position,
      uid: result.data.uid ?? '',
      telefon: result.data.telefon ?? '',
    },
  })

  // Cookie sofort setzen, damit Middleware nicht auf JWT-Refresh wartet
  const cookieStore = await cookies()
  cookieStore.set('onboarding_done', userId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Benachrichtigungs-E-Mail versenden (Fehler werden ignoriert)
  const clerkInstance = await clerkClient()
  const user = await clerkInstance.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress ?? ''
  sendOnboardingNotification({
    name: result.data.name,
    firma: result.data.firma,
    position: result.data.position,
    uid: result.data.uid,
    telefon: result.data.telefon,
    email,
  }).catch(() => {})

  redirect('/')
}
