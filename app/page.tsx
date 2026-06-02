import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ManufacturerCard } from '@/components/manufacturer-card'
import { supabase } from '@/lib/supabase'
import { MANUFACTURER_CATEGORIES } from '@/lib/types'

export const revalidate = 60

export default async function HomePage() {
  const { data: manufacturers } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name')

  const grouped = Object.fromEntries(
    MANUFACTURER_CATEGORIES.map(({ value }) => [
      value,
      manufacturers?.filter((m) => (m.category ?? 'sonstige') === value) ?? [],
    ])
  )

  const hasAny = manufacturers && manufacturers.length > 0

  return (
    <div className="page-shell">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-brand-dark-blue overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue/80 mb-3">
              ALUFEFA GmbH
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide leading-tight mb-3">
              Downloadcenter
            </h1>
            <p className="text-white/50 text-base max-w-xl">
              Produktkataloge, Datenblätter und technische Dokumentationen aller ALUFEFA-Hersteller.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-14 space-y-14">
          {!hasAny ? (
            <div className="text-center py-24">
              <p className="text-brand-gray">Noch keine Hersteller vorhanden.</p>
            </div>
          ) : (
            MANUFACTURER_CATEGORIES.map(({ value, label }) => {
              const items = grouped[value]
              if (!items || items.length === 0) return null
              return (
                <section key={value}>
                  <p className="section-label mb-6">{label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((m) => (
                      <ManufacturerCard key={m.id} manufacturer={m} />
                    ))}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
