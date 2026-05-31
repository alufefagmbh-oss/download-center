import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteManufacturer } from '@/lib/actions/manufacturers'

export default async function ManufacturersAdminPage() {
  const { data: manufacturers } = await supabaseAdmin
    .from('manufacturers')
    .select('*')
    .order('name')

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-gray">Hersteller</h1>
          <p className="text-brand-gray mt-1">Alle Hersteller verwalten</p>
        </div>
        <Link
          href="/admin/manufacturers/new"
          className="flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
        >
          <Plus size={16} />
          Neuer Hersteller
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
        <div className="bg-white border border-brand-light-gray overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark-gray text-white text-left">
                <th className="px-5 py-3 font-bold w-16">Bild</th>
                <th className="px-5 py-3 font-bold">Name</th>
                <th className="px-5 py-3 font-bold w-40">Slug</th>
                <th className="px-5 py-3 font-bold w-36 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {manufacturers.map((m) => (
                <tr key={m.id} className="border-t border-brand-light-gray hover:bg-gray-50">
                  <td className="px-5 py-3">
                    {m.image_url ? (
                      <div className="relative w-10 h-10 overflow-hidden bg-gray-100">
                        <Image src={m.image_url} alt={m.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-brand-light-gray flex items-center justify-center">
                        <span className="text-brand-gray text-xs">–</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-bold text-brand-dark-gray">
                    <Link href={`/admin/manufacturers/${m.id}`} className="hover:text-brand-blue">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-brand-gray font-mono text-xs">{m.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/manufacturers/${m.id}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold transition-colors"
                      >
                        <Pencil size={12} /> Bearbeiten
                      </Link>
                      <DeleteButton
                        action={deleteManufacturer.bind(null, m.id)}
                        label="Löschen"
                        confirmMessage={`Hersteller "${m.name}" wirklich löschen? Alle Produkte und Downloads werden ebenfalls gelöscht.`}
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
