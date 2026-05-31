import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ManufacturerForm } from '@/components/admin/manufacturer-form'
import { createManufacturer } from '@/lib/actions/manufacturers'

export default function NewManufacturerPage() {
  return (
    <main className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/manufacturers"
          className="flex items-center gap-1 text-sm text-brand-gray hover:text-brand-blue mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Zurück zu Hersteller
        </Link>
        <h1 className="text-2xl font-bold text-brand-dark-gray">Neuen Hersteller anlegen</h1>
        <p className="text-brand-gray mt-1">
          Füllen Sie das Formular aus und laden Sie ein Hintergrundbild hoch.
        </p>
      </div>

      <div className="bg-white border border-brand-light-gray p-8">
        <ManufacturerForm action={createManufacturer} submitLabel="Hersteller anlegen" />
      </div>
    </main>
  )
}
