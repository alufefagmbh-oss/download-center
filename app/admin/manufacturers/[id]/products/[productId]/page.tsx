import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/product-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { ProductStructureManager } from '@/components/admin/product-structure-manager'
import { updateProduct, deleteProduct } from '@/lib/actions/products'
import { fetchProductStructure } from '@/lib/fetch-product-structure'

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

  const { sections, looseGroups, standaloneFiles } = await fetchProductStructure(supabaseAdmin, productId)

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
