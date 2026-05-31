import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/product-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { updateProduct, deleteProduct } from '@/lib/actions/products'
import { deleteDownload } from '@/lib/actions/downloads'

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

  const { data: downloads } = await supabaseAdmin
    .from('downloads')
    .select('*')
    .eq('product_type_id', productId)
    .order('name')

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

        {/* Downloads */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-dark-gray">Downloads</h2>
              <p className="text-sm text-brand-gray">{downloads?.length ?? 0} Datei(en)</p>
            </div>
            <Link
              href={`/admin/manufacturers/${manufacturerId}/products/${productId}/downloads/new`}
              className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
            >
              <Plus size={14} /> Neuer Download
            </Link>
          </div>

          {!downloads || downloads.length === 0 ? (
            <div className="bg-white border border-brand-light-gray text-center py-12">
              <p className="text-brand-gray text-sm mb-3">Noch keine Downloads vorhanden.</p>
              <Link
                href={`/admin/manufacturers/${manufacturerId}/products/${productId}/downloads/new`}
                className="text-brand-blue font-bold text-sm hover:underline"
              >
                Ersten Download hinzufügen →
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-brand-light-gray overflow-hidden">
              {downloads.map((dl, i) => (
                <div
                  key={dl.id}
                  className={`px-5 py-4 ${i > 0 ? 'border-t border-brand-light-gray' : ''} hover:bg-gray-50`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-dark-gray truncate">{dl.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="inline-block bg-brand-light-gray text-brand-dark-gray px-2 py-0.5 text-xs font-bold">
                          {dl.file_type}
                        </span>
                        <span className="text-xs text-brand-gray">{dl.file_size}</span>
                        <span className="text-xs text-brand-gray">v{dl.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/admin/manufacturers/${manufacturerId}/products/${productId}/downloads/${dl.id}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold"
                      >
                        <Pencil size={12} /> Bearbeiten
                      </Link>
                      <DeleteButton
                        action={deleteDownload.bind(null, dl.id, productId, manufacturerId)}
                        label="Löschen"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
