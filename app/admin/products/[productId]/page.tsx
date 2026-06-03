import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteDownload } from '@/lib/actions/downloads'

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
  const manufacturer = (
    Array.isArray(manufacturerRaw) ? manufacturerRaw[0] : manufacturerRaw
  ) as { id: string; name: string } | null

  const { data: downloads } = await supabaseAdmin
    .from('downloads')
    .select('*')
    .eq('product_type_id', productId)
    .order('name')

  const manufacturerId = manufacturer?.id ?? product.manufacturer_id

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
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/manufacturers/${manufacturerId}/products/${productId}`}
            className="flex items-center gap-1.5 border border-brand-light-gray text-brand-dark-gray px-4 py-2 font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            <Pencil size={14} /> Produkt bearbeiten
          </Link>
          <Link
            href={`/admin/manufacturers/${manufacturerId}/products/${productId}/downloads/new`}
            className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
          >
            <Plus size={14} /> Neuer Download
          </Link>
        </div>
      </div>

      {!downloads || downloads.length === 0 ? (
        <div className="text-center py-20 bg-white border border-brand-light-gray">
          <p className="text-brand-gray mb-4">Noch keine Downloads vorhanden.</p>
          <Link
            href={`/admin/manufacturers/${manufacturerId}/products/${productId}/downloads/new`}
            className="bg-brand-blue text-white px-5 py-2.5 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
          >
            Ersten Download hinzufügen
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-brand-light-gray overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark-gray text-white text-left">
                <th className="px-5 py-3 font-bold">Name</th>
                <th className="px-5 py-3 font-bold w-24">Typ</th>
                <th className="px-5 py-3 font-bold w-28">Größe</th>
                <th className="px-5 py-3 font-bold w-24">Version</th>
                <th className="px-5 py-3 font-bold w-36 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((dl, i) => (
                <tr
                  key={dl.id}
                  className={`${i > 0 ? 'border-t border-brand-light-gray' : ''} hover:bg-gray-50`}
                >
                  <td className="px-5 py-4 font-bold text-brand-dark-gray">{dl.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-block bg-brand-light-gray text-brand-dark-gray px-2 py-0.5 text-xs font-bold">
                      {dl.file_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-brand-gray">{dl.file_size}</td>
                  <td className="px-5 py-4 text-brand-gray">v{dl.version}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
