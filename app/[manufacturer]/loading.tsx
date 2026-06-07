import { HeaderSkeleton, HeroSkeleton, ProductGridSkeleton, Pulse } from '@/components/skeletons'

export default function ManufacturerLoading() {
  return (
    <div className="page-shell">
      <HeaderSkeleton />
      <main className="flex-1">
        <HeroSkeleton />
        <section className="max-w-7xl mx-auto px-6 py-14">
          <Pulse className="h-3 w-28 mb-6 rounded" />
          <ProductGridSkeleton count={6} />
        </section>
      </main>
    </div>
  )
}
