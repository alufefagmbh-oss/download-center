'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Package, LogOut } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/manufacturers', label: 'Hersteller', icon: Building2, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-brand-dark-gray text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-xl font-bold tracking-wider">ALUFEFA</p>
        <p className="text-xs text-white/50 mt-0.5">Admin-Bereich</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors',
                isActive
                  ? 'bg-brand-blue text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 mb-3 transition-colors"
        >
          ← Zur Website
        </Link>
        <SignOutButton redirectUrl="/">
          <button className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors w-full">
            <LogOut size={13} />
            Abmelden
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
