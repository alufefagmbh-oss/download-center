import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ManufacturerForm } from '@/components/admin/manufacturer-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { updateManufacturer, deleteManufacturer } from '@/lib/actions/manufacturers'
import { deleteProduct } from '@/lib/actions/products'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditManufacturerPage({ params }: PageProps) {
  const { id } = await params

  const { data: manufacturer } = await supabaseAdmin
    .from('manufacturers')
    .select('*')
    .eq('id', id)
    .single()

  if (!manufacturer) notFound()

  const { data: products } = await supabaseAdmin
    .from('product_types')
    .select('*')
    .eq('manufacturer_id', id)
    .order('name')

  const updateAction = updateManufacturer.bind(null, id)

  return (
    <main className="p-8">
      <Link
        href="/admin/manufacturers"
        className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Alle Hersteller
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Edit Manufacturer */}
        <section>
          <h1 className="text-2xl font-bold text-brand-dark-gray mb-1">{manufacturer.name}</h1>
          <p className="text-brand-gray mb-6">Hersteller bearbeiten</p>

          <div className="bg-white border border-brand-light-gray p-8">
            <ManufacturerForm
              action={updateAction}
              defaultValues={manufacturer}
              submitLabel="Änderungen speichern"
            />
          </div>

          <div className="mt-4 bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700 mb-3 font-bold">Gefahrenzone</p>
            <p className="text-xs text-red-600 mb-3">
              Das Löschen entfernt diesen Hersteller mitsamt allen Produkten und Downloads unwiderruflich.
            </p>
            <DeleteButton
              action={deleteManufacturer.bind(null, id)}
              label="Hersteller endgültig löschen"
              confirmMessage={`Hersteller "${manufacturer.name}" wirklich löschen?`}
            />
          </div>
        </section>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-dark-gray">Produkte</h2>
              <p className="text-sm text-brand-gray">{products?.length ?? 0} Produktart(en)</p>
            </div>
            <Link
              href={`/admin/manufacturers/${id}/products/new`}
              className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
            >
              <Plus size={14} /> Neues Produkt
            </Link>
          </div>

          {!products || products.length === 0 ? (
            <div className="bg-white border border-brand-light-gray text-center py-12">
              <p className="text-brand-gray text-sm mb-3">Noch keine Produktarten angelegt.</p>
              <Link
                href={`/admin/manufacturers/${id}/products/new`}
                className="text-brand-blue font-bold text-sm hover:underline"
              >
                Erste Produktart anlegen →
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-brand-light-gray overflow-hidden">
              {products.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-brand-light-gray' : ''} hover:bg-gray-50`}
                >
                  {p.image_url ? (
                    <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-gray-100">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 shrink-0 bg-brand-light-gray" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark-gray truncate">{p.name}</p>
                    <p className="text-xs text-brand-gray font-mono">{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/admin/manufacturers/${id}/products/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold"
                    >
                      <Pencil size={12} /> Bearbeiten
                    </Link>
                    <DeleteButton
                      action={deleteProduct.bind(null, p.id, id)}
                      label="Löschen"
                    />
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
