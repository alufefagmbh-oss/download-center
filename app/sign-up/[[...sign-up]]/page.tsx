import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-wider text-brand-dark-blue">ALUFEFA</h1>
        <p className="text-brand-gray mt-1">Downloadcenter — Konto erstellen</p>
      </div>
      <SignUp />
    </div>
  )
}
