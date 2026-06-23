import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GroupedDownloadCatalog } from '@/components/grouped-download-catalog'
import { DownloadCatalogSkeleton } from '@/components/skeletons'
import { supabase } from '@/lib/supabase'
import { fetchProductStructure } from '@/lib/fetch-product-structure'

export const revalidate = 60

interface PageProps {
  params: Promise<{ manufacturer: string; product: string }>
}

// Downloads streamen rein — Hero ist schon sichtbar
async function DownloadSection({ productId, manufacturerSlug, manufacturerName, productName }: {
  productId: string
  manufacturerSlug: string
  manufacturerName: string
  productName: string
}) {
  const [{ sections, looseGroups, standaloneFiles }, { userId }] = await Promise.all([
    fetchProductStructure(supabase, productId),
    auth(),
  ])

  return (
    <GroupedDownloadCatalog
      sections={sections}
      looseGroups={looseGroups}
      standaloneFiles={standaloneFiles}
      isLoggedIn={!!userId}
    />
  )
}

export default async function ProductPage({ params }: PageProps) {
  const { manufacturer: manufacturerSlug, product: productSlug } = await params

  // Beide Queries parallel starten wo möglich
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('slug', manufacturerSlug)
    .single()

  if (!manufacturer) notFound()

  const { data: product } = await supabase
    .from('product_types')
    .select('*')
    .eq('slug', productSlug)
    .eq('manufacturer_id', manufacturer.id)
    .single()

  if (!product) notFound()

  return (
    <div className="page-shell">
      <Header />

      <main className="flex-1">
        {/* Hero — rendert sofort */}
        <section className="relative h-56 sm:h-64 bg-brand-dark-gray overflow-hidden">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/30" />
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-end pb-8">
            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-3">
              <Link href="/" className="hover:text-white/70 transition-colors">Hersteller</Link>
              <ChevronRight size={12} />
              <Link href={`/${manufacturerSlug}`} className="hover:text-white/70 transition-colors">
                {manufacturer.name}
              </Link>
              <ChevronRight size={12} />
              <span className="text-white/70">{product.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
              {product.name}
            </h1>
          </div>
        </section>

        {/* Downloads streamen rein */}
        <section className="max-w-7xl mx-auto px-6 py-14">
          <p className="section-label">Downloads</p>
          <Suspense fallback={<DownloadCatalogSkeleton />}>
            <DownloadSection
              productId={product.id}
              manufacturerSlug={manufacturerSlug}
              manufacturerName={manufacturer.name}
              productName={product.name}
            />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  )
}
