import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const meta = user?.publicMetadata as Record<string, unknown> | undefined
  if (meta?.onboardingComplete === true) redirect('/')

  const saved = user?.privateMetadata as Record<string, string> | undefined

  // Name aus Clerk-Profil vorausfüllen falls noch nicht im Onboarding gespeichert
  const defaultName =
    saved?.name ||
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  return (
    <div className="min-h-screen bg-brand-dark-blue flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue/80 mb-2">
            ALUFEFA GmbH
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">Konto vervollständigen</h1>
          <p className="text-white/50 text-sm">
            Bitte ergänzen Sie Ihre Angaben, um das Downloadcenter nutzen zu können.
          </p>
        </div>

        <div className="bg-white p-8">
          <OnboardingForm defaults={{ ...saved, name: defaultName }} />
        </div>
      </div>
    </div>
  )
}
