'use client'
import { useActionState, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadZone } from '@/components/admin/upload-zone'
import type { ActionState, ProductType } from '@/lib/types'

interface ProductFormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<ProductType>
  submitLabel?: string
}

export function ProductForm({
  action,
  defaultValues,
  submitLabel = 'Speichern',
}: ProductFormProps) {
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

      <div>
        <Label htmlFor="name">Produkt-Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="z.B. Rollladensysteme"
          required
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <Label>Hintergrundbild</Label>
        <input type="hidden" name="image_url" value={imageUrl} />

        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border border-brand-light-gray">
              <Image src={imageUrl} alt="Vorschau" fill className="object-cover" />
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setImageUrl('')}>
              Bild entfernen
            </Button>
          </div>
        ) : (
          <UploadZone
            endpoint="imageUploader"
            onUploadComplete={({ url }) => setImageUrl(url)}
            label="Bild hochladen"
            hint="JPG, PNG, WebP · max. 4 MB"
          />
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
