import { HeaderSkeleton, HeroSkeleton, DownloadCatalogSkeleton, Pulse } from '@/components/skeletons'

export default function ProductLoading() {
  return (
    <div className="page-shell">
      <HeaderSkeleton />
      <main className="flex-1">
        <HeroSkeleton />
        <section className="max-w-7xl mx-auto px-6 py-14">
          <Pulse className="h-3 w-24 mb-6 rounded" />
          <DownloadCatalogSkeleton />
        </section>
      </main>
    </div>
  )
}
