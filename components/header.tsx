import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Globe } from 'lucide-react'

export async function Header() {
  const { userId } = await auth()
  let isAdmin = false
  if (userId) {
    const user = await currentUser()
    isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
  }

  return (
    <header className="bg-[#f4f4f4] shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2.5 shrink-0">
          <span className="text-[1.45rem] font-bold tracking-[0.12em] text-brand-dark-gray leading-none">
            ALUFEFA
          </span>
          <span className="hidden sm:inline text-[0.7rem] font-bold tracking-[0.18em] uppercase text-brand-gray leading-none">
            Downloadcenter
          </span>
        </Link>

        {/* Right */}
        <nav className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center text-xs font-bold tracking-widest uppercase text-brand-gray hover:text-brand-dark-gray transition-colors px-3 py-1.5 border border-brand-light-gray hover:border-brand-gray"
            >
              Admin
            </Link>
          )}

          {userId ? (
            <>
              <a
                href="https://www.alufefa.at"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-gray hover:text-brand-dark-gray transition-colors"
              >
                <Globe size={13} />
                www.alufefa.at
              </a>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-brand-gray hover:text-brand-dark-gray transition-colors px-4 py-2">
                  Anmelden
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-bold bg-brand-blue hover:bg-brand-dark-blue text-white px-4 py-2 transition-colors">
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
