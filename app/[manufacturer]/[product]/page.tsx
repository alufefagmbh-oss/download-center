import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GroupedDownloadCatalog } from '@/components/grouped-download-catalog'
import { supabase } from '@/lib/supabase'
import type { DownloadSection, DownloadGroup, Download } from '@/lib/types'

export const revalidate = 60

interface PageProps {
  params: Promise<{ manufacturer: string; product: string }>
}

function sortByOrder<T extends { sort_order?: number }>(arr: T[] | null): T[] {
  return (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export default async function ProductPage({ params }: PageProps) {
  const { manufacturer: manufacturerSlug, product: productSlug } = await params

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

  // Sections with nested groups and downloads
  const { data: sectionsRaw } = await supabase
    .from('download_sections')
    .select('*, download_groups(*, downloads(*))')
    .eq('product_type_id', product.id)
    .order('sort_order')

  // Loose groups (no section)
  const { data: looseGroupsRaw } = await supabase
    .from('download_groups')
    .select('*, downloads(*)')
    .eq('product_type_id', product.id)
    .is('section_id', null)
    .order('sort_order')

  // Standalone downloads (no group)
  const { data: standaloneRaw } = await supabase
    .from('downloads')
    .select('*')
    .eq('product_type_id', product.id)
    .is('group_id', null)
    .order('sort_order')

  const sections = sortByOrder(sectionsRaw ?? []).map(
    (s: DownloadSection & { download_groups?: (DownloadGroup & { downloads?: Download[] })[] }) => ({
      ...s,
      groups: sortByOrder(s.download_groups ?? []).map((g) => ({
        ...g,
        downloads: sortByOrder(g.downloads ?? []),
      })),
    })
  )

  const looseGroups = sortByOrder(looseGroupsRaw ?? []).map(
    (g: DownloadGroup & { downloads?: Download[] }) => ({
      ...g,
      downloads: sortByOrder(g.downloads ?? []),
    })
  )

  const standaloneFiles = sortByOrder(standaloneRaw ?? [])

  const { userId } = await auth()

  return (
    <div className="page-shell">
      <Header />

      <main className="flex-1">
        {/* Hero */}
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

        {/* Downloads */}
        <section className="max-w-7xl mx-auto px-6 py-14">
          <p className="section-label">Downloads</p>
          <GroupedDownloadCatalog
            sections={sections}
            looseGroups={looseGroups}
            standaloneFiles={standaloneFiles}
            isLoggedIn={!!userId}
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
