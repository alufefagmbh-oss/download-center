import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { DownloadForm } from '@/components/admin/download-form'
import { createDownload } from '@/lib/actions/downloads'

interface PageProps {
  params: Promise<{ id: string; productId: string }>
  searchParams: Promise<{ groupId?: string }>
}

export default async function NewDownloadPage({ params, searchParams }: PageProps) {
  const { id: manufacturerId, productId } = await params
  const { groupId } = await searchParams

  const { data: product } = await supabaseAdmin
    .from('product_types')
    .select('name, manufacturer:manufacturers(name)')
    .eq('id', productId)
    .single()

  if (!product) notFound()

  const manufacturerRaw = product.manufacturer as unknown
  const manufacturer = (Array.isArray(manufacturerRaw) ? manufacturerRaw[0] : manufacturerRaw) as { name: string } | null

  // If groupId provided, look up the group name for display
  let groupName: string | null = null
  if (groupId) {
    const { data: group } = await supabaseAdmin
      .from('download_groups')
      .select('name')
      .eq('id', groupId)
      .single()
    groupName = group?.name ?? null
  }

  const action = createDownload.bind(null, productId, manufacturerId, groupId ?? null)

  return (
    <main className="p-8">
      <Link
        href={`/admin/manufacturers/${manufacturerId}/products/${productId}`}
        className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Zurück zu {product.name}
      </Link>

      <h1 className="text-2xl font-bold text-brand-dark-gray mb-1">Neuen Download hinzufügen</h1>
      <p className="text-brand-gray mb-8">
        Produkt: <strong>{product.name}</strong>
        {manufacturer && <> · Hersteller: <strong>{manufacturer.name}</strong></>}
        {groupName && <> · Gruppe: <strong>{groupName}</strong></>}
      </p>

      <div className="bg-white border border-brand-light-gray p-8">
        <DownloadForm action={action} submitLabel="Download hinzufügen" />
      </div>
    </main>
  )
}
