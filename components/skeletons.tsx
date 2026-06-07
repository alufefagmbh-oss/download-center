export function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`} />
}

export function HeroSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`bg-brand-dark-gray ${tall ? 'h-64 sm:h-80' : 'h-56 sm:h-64'} animate-pulse`} />
  )
}

export function ManufacturerCardSkeleton() {
  return <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
}

export function ManufacturerGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ManufacturerCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductCardSkeleton() {
  return <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DownloadGroupSkeleton() {
  return (
    <div className="border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="flex-1 h-4 bg-gray-200 rounded" />
        <div className="w-24 h-6 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export function DownloadCatalogSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <DownloadGroupSkeleton key={i} />
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="h-16 bg-[#f4f4f4] shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]" />
  )
}
