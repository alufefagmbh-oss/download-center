import Link from 'next/link'
import { Plus } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductsBoard } from '@/components/admin/products-board'

export default async function ProductsAdminPage() {
  const [{ data: manufacturers }, { data: products }] = await Promise.all([
    supabaseAdmin.from('manufacturers').select('*').order('name'),
    supabaseAdmin.from('product_types').select('*').order('sort_order').order('name'),
  ])

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-gray">Produkte</h1>
          <p className="text-brand-gray mt-1">
            Alle Produkte nach Hersteller — per Drag &amp; Drop verschieben
          </p>
        </div>
        <Link
          href="/admin/manufacturers"
          className="flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
        >
          <Plus size={16} />
          Hersteller verwalten
        </Link>
      </div>

      {!manufacturers || manufacturers.length === 0 ? (
        <div className="text-center py-20 bg-white border border-brand-light-gray">
          <p className="text-brand-gray mb-4">Noch keine Hersteller angelegt.</p>
          <Link
            href="/admin/manufacturers/new"
            className="bg-brand-blue text-white px-5 py-2.5 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
          >
            Ersten Hersteller anlegen
          </Link>
        </div>
      ) : (
        <ProductsBoard
          manufacturers={manufacturers}
          products={products ?? []}
        />
      )}
    </main>
  )
}
