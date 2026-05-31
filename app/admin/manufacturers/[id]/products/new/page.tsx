import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/product-form'
import { createProduct } from '@/lib/actions/products'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewProductPage({ params }: PageProps) {
  const { id: manufacturerId } = await params

  const { data: manufacturer } = await supabaseAdmin
    .from('manufacturers')
    .select('name')
    .eq('id', manufacturerId)
    .single()

  if (!manufacturer) notFound()

  const action = createProduct.bind(null, manufacturerId)

  return (
    <main className="p-8">
      <Link
        href={`/admin/manufacturers/${manufacturerId}`}
        className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Zurück zu {manufacturer.name}
      </Link>

      <h1 className="text-2xl font-bold text-brand-dark-gray mb-1">Neues Produkt anlegen</h1>
      <p className="text-brand-gray mb-8">
        Für Hersteller: <strong>{manufacturer.name}</strong>
      </p>

      <div className="bg-white border border-brand-light-gray p-8">
        <ProductForm action={action} submitLabel="Produkt anlegen" />
      </div>
    </main>
  )
}
