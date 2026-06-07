import { HeaderSkeleton, HeroSkeleton, ManufacturerGridSkeleton, Pulse } from '@/components/skeletons'

export default function HomeLoading() {
  return (
    <div className="page-shell">
      <HeaderSkeleton />
      <main className="flex-1">
        <HeroSkeleton tall />
        <div className="max-w-7xl mx-auto px-6 py-14 space-y-14">
          <section>
            <Pulse className="h-3 w-36 mb-6 rounded" />
            <ManufacturerGridSkeleton count={3} />
          </section>
          <section>
            <Pulse className="h-3 w-44 mb-6 rounded" />
            <ManufacturerGridSkeleton count={6} />
          </section>
        </div>
      </main>
    </div>
  )
}
