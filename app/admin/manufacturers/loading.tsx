import { Pulse } from '@/components/skeletons'

export default function ManufacturersLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Pulse className="h-7 w-36 rounded" />
        <Pulse className="h-9 w-44 rounded" />
      </div>
      <div className="bg-white border border-brand-light-gray overflow-hidden animate-pulse">
        <Pulse className="h-11 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-t border-brand-light-gray">
            <Pulse className="w-10 h-10 rounded" />
            <Pulse className="flex-1 h-4 rounded" />
            <Pulse className="w-24 h-5 rounded" />
            <Pulse className="w-20 h-7 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
