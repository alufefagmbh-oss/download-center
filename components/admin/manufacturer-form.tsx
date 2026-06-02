'use client'
import { useActionState, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, AlertCircle, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadButton } from '@/lib/uploadthing'
import { MANUFACTURER_CATEGORIES } from '@/lib/types'
import type { ActionState, Manufacturer } from '@/lib/types'

interface ManufacturerFormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<Manufacturer>
  submitLabel?: string
}

export function ManufacturerForm({
  action,
  defaultValues,
  submitLabel = 'Speichern',
}: ManufacturerFormProps) {
  const [imageUrl, setImageUrl] = useState(defaultValues?.image_url ?? '')
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      {state?.success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3">
          <CheckCircle size={16} />
          <span className="text-sm font-bold">{state.message}</span>
        </div>
      )}

      {state?.message && !state.success && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          <AlertCircle size={16} />
          <span className="text-sm">{state.message}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <Label htmlFor="name">Hersteller-Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="z.B. Müller GmbH"
          required
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Kategorie */}
      <div>
        <Label htmlFor="category">Kategorie *</Label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues?.category ?? 'sonstige'}
          required
          className="mt-1 block w-full border border-brand-light-gray bg-white px-3 py-2 text-sm text-brand-dark-gray focus:border-brand-blue focus:outline-none"
        >
          {MANUFACTURER_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {state?.errors?.category && (
          <p className="mt-1 text-xs text-red-600">{state.errors.category[0]}</p>
        )}
      </div>

      {/* Image upload */}
      <div>
        <Label>Hintergrundbild</Label>
        <input type="hidden" name="image_url" value={imageUrl} />

        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border border-brand-light-gray">
              <Image
                src={imageUrl}
                alt="Vorschau"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setImageUrl('')}
            >
              Bild entfernen
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-brand-light-gray p-6 text-center bg-gray-50">
            <ImageIcon className="mx-auto mb-2 text-brand-light-gray" size={32} />
            <p className="text-sm text-brand-gray mb-3">
              Bild hochladen (max. 4 MB, JPG/PNG/WebP)
            </p>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res[0]) setImageUrl(res[0].ufsUrl ?? res[0].url)
              }}
              onUploadError={(err) => {
                console.error('Upload error:', err)
              }}
            />
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? 'Wird gespeichert...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
