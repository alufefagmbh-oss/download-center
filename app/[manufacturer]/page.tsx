import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

interface PageProps {
  params: Promise<{ manufacturer: string }>
}

export default async function ManufacturerPage({ params }: PageProps) {
  const { manufacturer: slug } = await params

  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!manufacturer) notFound()

  const { data: products } = await supabase
    .from('product_types')
    .select('*')
    .eq('manufacturer_id', manufacturer.id)
    .order('sort_order')
    .order('name')

  return (
    <div className="page-shell">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-56 sm:h-64 bg-brand-dark-gray overflow-hidden">
          {manufacturer.image_url && (
            <Image
              src={manufacturer.image_url}
              alt={manufacturer.name}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/30" />
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-end pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-3">
              <Link href="/" className="hover:text-white/70 transition-colors">Hersteller</Link>
              <ChevronRight size={12} />
              <span className="text-white/70">{manufacturer.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
              {manufacturer.name}
            </h1>
          </div>
        </section>

        {/* Products */}
        <section className="max-w-7xl mx-auto px-6 py-14">
          <p className="section-label">Produktarten</p>

          {!products || products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-brand-gray">Keine Produkte für diesen Hersteller vorhanden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} manufacturer={manufacturer} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
