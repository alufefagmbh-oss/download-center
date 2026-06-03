import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { Manufacturer, ProductType } from '@/lib/types'

export function ProductCard({ product, manufacturer }: { product: ProductType; manufacturer: Manufacturer }) {
  return (
    <Link
      href={`/${manufacturer.slug}/${product.slug}`}
      className="alufefa-card group aspect-[16/10] bg-brand-blue block"
    >
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-brand-dark-gray" />
      )}

      {/* Black overlay — high transparency */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/70" />

      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
        <h2 className="text-white text-xl font-bold tracking-wide leading-tight pr-4">
          {product.name}
        </h2>
        <span className="shrink-0 w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-brand-dark-blue group-hover:border-white transition-all duration-300">
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}
