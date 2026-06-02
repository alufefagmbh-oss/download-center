import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Setzt den Onboarding-Cookie und leitet weiter.
// Wird aufgerufen wenn Onboarding bereits abgeschlossen ist (z.B. Admins
// oder Nutzer die den Cookie verloren haben) um den Redirect-Loop zu brechen.
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const dest = req.nextUrl.searchParams.get('next') ?? '/'
  const response = NextResponse.redirect(new URL(dest, req.url))
  response.cookies.set('onboarding_done', userId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
