import { Suspense } from 'react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ManufacturerCard } from '@/components/manufacturer-card'
import { ManufacturerGridSkeleton, Pulse } from '@/components/skeletons'
import { supabase } from '@/lib/supabase'
import { MANUFACTURER_CATEGORIES } from '@/lib/types'

export const revalidate = 60

// Daten-Komponente — streamt rein, während Hero schon sichtbar ist
async function ManufacturersList() {
  const { data: manufacturers } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name')

  if (!manufacturers?.length) {
    return (
      <div className="text-center py-24">
        <p className="text-brand-gray">Noch keine Hersteller vorhanden.</p>
      </div>
    )
  }

  const grouped = Object.fromEntries(
    MANUFACTURER_CATEGORIES.map(({ value }) => [
      value,
      manufacturers.filter((m) => (m.category ?? 'sonstige') === value),
    ])
  )

  return (
    <div className="space-y-14">
      {MANUFACTURER_CATEGORIES.map(({ value, label }) => {
        const items = grouped[value]
        if (!items?.length) return null
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
      })}
    </div>
  )
}

function ManufacturerListSkeleton() {
  return (
    <div className="space-y-14">
      <section>
        <Pulse className="h-3 w-36 mb-6 rounded" />
        <ManufacturerGridSkeleton count={3} />
      </section>
      <section>
        <Pulse className="h-3 w-44 mb-6 rounded" />
        <ManufacturerGridSkeleton count={6} />
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="page-shell">
      <Header />

      <main className="flex-1">
        {/* Hero — statisches Bild, rendert sofort */}
        <section className="relative overflow-hidden h-64 sm:h-80">
          <Image
            src="/images/ALUFEFA_Firmengebäude_Braunau_2.jpg"
            alt="ALUFEFA Firmengebäude Braunau"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/60 mb-2">
              ALUFEFA
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide leading-tight mb-3">
              Downloadcenter
            </h1>
            <p className="text-white/70 text-base max-w-xl">
              Produktkataloge, Datenblätter, technische Dokumentationen, CAD-Dateien und vieles mehr.
            </p>
          </div>
        </section>

        {/* Hersteller-Liste streamt rein */}
        <div className="max-w-7xl mx-auto px-6 py-14">
          <Suspense fallback={<ManufacturerListSkeleton />}>
            <ManufacturersList />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
