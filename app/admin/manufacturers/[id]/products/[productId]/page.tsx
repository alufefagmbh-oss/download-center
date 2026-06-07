import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/product-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { ProductStructureManager } from '@/components/admin/product-structure-manager'
import { updateProduct, deleteProduct } from '@/lib/actions/products'
import type { DownloadSection, DownloadGroup, Download } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string; productId: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id: manufacturerId, productId } = await params

  const { data: manufacturer } = await supabaseAdmin
    .from('manufacturers')
    .select('name')
    .eq('id', manufacturerId)
    .single()

  const { data: product } = await supabaseAdmin
    .from('product_types')
    .select('*')
    .eq('id', productId)
    .eq('manufacturer_id', manufacturerId)
    .single()

  if (!manufacturer || !product) notFound()

  // Fetch sections with their groups and downloads
  const { data: sectionsRaw } = await supabaseAdmin
    .from('download_sections')
    .select('*, download_groups(*, downloads(*))')
    .eq('product_type_id', productId)
    .order('sort_order')

  // Fetch loose groups (no section) with their downloads
  const { data: looseGroupsRaw } = await supabaseAdmin
    .from('download_groups')
    .select('*, downloads(*)')
    .eq('product_type_id', productId)
    .is('section_id', null)
    .order('sort_order')

  // Fetch standalone downloads (no group)
  const { data: standaloneRaw } = await supabaseAdmin
    .from('downloads')
    .select('*')
    .eq('product_type_id', productId)
    .is('group_id', null)
    .order('sort_order')

  // Normalize nested data (Supabase returns arrays for relations)
  function sortByOrder<T extends { sort_order?: number }>(arr: T[] | null): T[] {
    return (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }

  const sections = sortByOrder(sectionsRaw ?? []).map((s: DownloadSection & { download_groups?: (DownloadGroup & { downloads?: Download[] })[] }) => ({
    ...s,
    groups: sortByOrder(s.download_groups ?? []).map((g) => ({
      ...g,
      downloads: sortByOrder(g.downloads ?? []),
    })),
  }))

  const looseGroups = sortByOrder(looseGroupsRaw ?? []).map((g: DownloadGroup & { downloads?: Download[] }) => ({
    ...g,
    downloads: sortByOrder(g.downloads ?? []),
  }))

  const standaloneFiles = sortByOrder(standaloneRaw ?? [])

  const updateAction = updateProduct.bind(null, productId, manufacturerId)

  return (
    <main className="p-8">
      <Link
        href={`/admin/manufacturers/${manufacturerId}`}
        className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Zurück zu {manufacturer.name}
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Edit Product */}
        <section>
          <h1 className="text-2xl font-bold text-brand-dark-gray mb-1">{product.name}</h1>
          <p className="text-brand-gray mb-6">Produkt bearbeiten</p>

          <div className="bg-white border border-brand-light-gray p-8">
            <ProductForm
              action={updateAction}
              defaultValues={product}
              submitLabel="Änderungen speichern"
            />
          </div>

          <div className="mt-4 bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700 mb-2 font-bold">Gefahrenzone</p>
            <p className="text-xs text-red-600 mb-3">
              Das Löschen entfernt dieses Produkt mitsamt allen Downloads unwiderruflich.
            </p>
            <DeleteButton
              action={deleteProduct.bind(null, productId, manufacturerId)}
              label="Produkt endgültig löschen"
            />
          </div>
        </section>

        {/* Structure Manager */}
        <section>
          <ProductStructureManager
            sections={sections}
            looseGroups={looseGroups}
            standaloneFiles={standaloneFiles}
            productTypeId={productId}
            manufacturerId={manufacturerId}
          />
        </section>
      </div>
    </main>
  )
}
