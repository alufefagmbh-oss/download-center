import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export async function Header() {
  const { userId } = await auth()
  let isAdmin = false
  if (userId) {
    const user = await currentUser()
    isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
  }

  return (
    <header className="bg-brand-dark-blue">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2.5 shrink-0">
          <span className="text-[1.45rem] font-bold tracking-[0.12em] text-white leading-none">
            ALUFEFA
          </span>
          <span className="hidden sm:inline text-[0.7rem] font-bold tracking-[0.18em] uppercase text-white/40 leading-none">
            Downloadcenter
          </span>
        </Link>

        {/* Right */}
        <nav className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center text-xs font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors px-3 py-1.5 border border-white/20 hover:border-white/50 mr-1"
            >
              Admin
            </Link>
          )}

          {userId ? (
            <UserButton />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-white/70 hover:text-white transition-colors px-4 py-2">
                  Anmelden
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-bold bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 transition-colors">
                  Registrieren
                </button>
              </SignUpButton>
            </>
          )}
        </nav>

      </div>
    </header>
  )
}
