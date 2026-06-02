import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const isOnboardingExempt = createRouteMatcher([
  '/onboarding',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()

  if (isAdminRoute(request)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Onboarding-Pflicht für eingeloggte Nicht-Admin-User
  if (userId && !isOnboardingExempt(request)) {
    const meta = sessionClaims?.publicMetadata as Record<string, unknown> | undefined
    const isAdmin = meta?.role === 'admin'
    // Cookie wird direkt nach dem Onboarding gesetzt → kein JWT-Timing-Problem
    const cookieDone = request.cookies.get('onboarding_done')?.value === '1'

    if (!isAdmin && !cookieDone && meta?.onboardingComplete !== true) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
