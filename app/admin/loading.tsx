import { Pulse } from '@/components/skeletons'

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-brand-light-gray p-6 animate-pulse">
            <Pulse className="h-3 w-20 mb-3 rounded" />
            <Pulse className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-brand-light-gray p-6 animate-pulse space-y-3">
        <Pulse className="h-4 w-40 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Pulse key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    </div>
  )
}
