import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ManufacturerCard } from '@/components/manufacturer-card'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

export default async function HomePage() {
  const { data: manufacturers } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name')

  return (
    <div className="page-shell">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-brand-dark-blue overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)', backgroundSize: '24px 24px' }}
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

        {/* Manufacturers */}
        <section className="max-w-7xl mx-auto px-6 py-14">
          <p className="section-label">Hersteller</p>

          {!manufacturers || manufacturers.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-brand-gray">Noch keine Hersteller vorhanden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {manufacturers.map((m) => (
                <ManufacturerCard key={m.id} manufacturer={m} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
