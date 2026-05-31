import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { DownloadForm } from '@/components/admin/download-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { updateDownload, deleteDownload } from '@/lib/actions/downloads'

interface PageProps {
  params: Promise<{ id: string; productId: string; downloadId: string }>
}

export default async function EditDownloadPage({ params }: PageProps) {
  const { id: manufacturerId, productId, downloadId } = await params

  const { data: download } = await supabaseAdmin
    .from('downloads')
    .select('*')
    .eq('id', downloadId)
    .eq('product_type_id', productId)
    .single()

  if (!download) notFound()

  const { data: product } = await supabaseAdmin
    .from('product_types')
    .select('name')
    .eq('id', productId)
    .single()

  const updateAction = updateDownload.bind(null, downloadId, productId, manufacturerId)

  return (
    <main className="p-8">
      <Link
        href={`/admin/manufacturers/${manufacturerId}/products/${productId}`}
        className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Zurück zu {product?.name ?? 'Produkt'}
      </Link>

      <h1 className="text-2xl font-bold text-brand-dark-gray mb-1">Download bearbeiten</h1>
      <p className="text-brand-gray mb-8">{download.name}</p>

      <div className="max-w-lg space-y-6">
        <div className="bg-white border border-brand-light-gray p-8">
          <DownloadForm
            action={updateAction}
            defaultValues={download}
            submitLabel="Änderungen speichern"
          />
        </div>

        <div className="bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700 mb-2 font-bold">Gefahrenzone</p>
          <DeleteButton
            action={deleteDownload.bind(null, downloadId, productId, manufacturerId)}
            label="Download endgültig löschen"
          />
        </div>
      </div>
    </main>
  )
}
