'use server'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import type { ActionState } from '@/lib/types'

const OnboardingSchema = z.object({
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
      firma: result.data.firma,
      position: result.data.position,
      uid: result.data.uid ?? '',
      telefon: result.data.telefon ?? '',
    },
  })

  redirect('/')
}
