'use client'
import { useActionState, useState } from 'react'
import { CheckCircle, AlertCircle, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadButton } from '@/lib/uploadthing'
import { formatFileSize, getFileType } from '@/lib/utils'
import type { ActionState, Download } from '@/lib/types'

interface DownloadFormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<Download>
  submitLabel?: string
}

export function DownloadForm({
  action,
  defaultValues,
  submitLabel = 'Speichern',
}: DownloadFormProps) {
  const [fileUrl, setFileUrl] = useState(defaultValues?.file_url ?? '')
  const [fileType, setFileType] = useState(defaultValues?.file_type ?? '')
  const [fileSize, setFileSize] = useState(defaultValues?.file_size ?? '')
  const [fileName, setFileName] = useState('')
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
        <Label htmlFor="name">Bezeichnung *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? fileName}
          placeholder="z.B. Montageanleitung 2024"
          required
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      {/* File upload */}
      <div>
        <Label>Datei *</Label>
        <input type="hidden" name="file_url" value={fileUrl} />
        <input type="hidden" name="file_type" value={fileType} />
        <input type="hidden" name="file_size" value={fileSize} />

        {fileUrl ? (
          <div className="border border-brand-light-gray bg-gray-50 p-4 flex items-center gap-4">
            <FileIcon className="text-brand-blue shrink-0" size={28} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-dark-gray truncate text-sm">{fileName || 'Hochgeladen'}</p>
              <p className="text-xs text-brand-gray mt-0.5">
                {fileType} · {fileSize}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              setFileUrl(''); setFileType(''); setFileSize(''); setFileName('')
            }}>
              Entfernen
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-brand-light-gray p-6 text-center bg-gray-50">
            <FileIcon className="mx-auto mb-2 text-brand-light-gray" size={32} />
            <p className="text-sm text-brand-gray mb-3">
              PDF, Word, Excel, ZIP (max. 64 MB)
            </p>
            <UploadButton
              endpoint="fileUploader"
              onClientUploadComplete={(res) => {
                if (res[0]) {
                  const file = res[0]
                  setFileUrl(file.ufsUrl ?? file.url)
                  setFileType(getFileType(file.type, file.name))
                  setFileSize(formatFileSize(file.size))
                  setFileName(file.name)
                }
              }}
              onUploadError={(err) => console.error(err)}
            />
          </div>
        )}
        {state?.errors?.file_url && (
          <p className="mt-1 text-xs text-red-600">{state.errors.file_url[0]}</p>
        )}
      </div>

      {/* Version */}
      <div>
        <Label htmlFor="version">Version *</Label>
        <Input
          id="version"
          name="version"
          defaultValue={defaultValues?.version ?? ''}
          placeholder="z.B. 2024-01 oder 1.0"
          required
        />
        {state?.errors?.version && (
          <p className="mt-1 text-xs text-red-600">{state.errors.version[0]}</p>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={pending || !fileUrl} size="lg">
          {pending ? 'Wird gespeichert...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
