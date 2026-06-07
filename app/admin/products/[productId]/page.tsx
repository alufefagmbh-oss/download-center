import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductStructureManager } from '@/components/admin/product-structure-manager'
import { fetchProductStructure } from '@/lib/fetch-product-structure'

interface PageProps {
  params: Promise<{ productId: string }>
}

export default async function ProductDownloadsPage({ params }: PageProps) {
  const { productId } = await params

  const { data: product } = await supabaseAdmin
    .from('product_types')
    .select('*, manufacturer:manufacturers(*)')
    .eq('id', productId)
    .single()

  if (!product) notFound()

  const manufacturerRaw = product.manufacturer as unknown
  const manufacturer = (Array.isArray(manufacturerRaw) ? manufacturerRaw[0] : manufacturerRaw) as { id: string; name: string } | null
  const manufacturerId = manufacturer?.id ?? product.manufacturer_id

  const { sections, looseGroups, standaloneFiles } = await fetchProductStructure(supabaseAdmin, productId)

  return (
    <main className="p-8">
      <Link
        href="/admin/products"
        className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Zurück zu Produkte
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-gray">{product.name}</h1>
          {manufacturer && (
            <p className="text-brand-gray mt-1">
              Hersteller:{' '}
              <Link
                href={`/admin/manufacturers/${manufacturerId}`}
                className="text-brand-blue hover:underline font-bold"
              >
                {manufacturer.name}
              </Link>
            </p>
          )}
        </div>
        <Link
          href={`/admin/manufacturers/${manufacturerId}/products/${productId}`}
          className="flex items-center gap-1.5 border border-brand-light-gray text-brand-dark-gray px-4 py-2 font-bold hover:bg-gray-50 transition-colors text-sm"
        >
          <Pencil size={14} /> Produkt bearbeiten
        </Link>
      </div>

      <ProductStructureManager
        sections={sections}
        looseGroups={looseGroups}
        standaloneFiles={standaloneFiles}
        productTypeId={productId}
        manufacturerId={manufacturerId}
      />
    </main>
  )
}
