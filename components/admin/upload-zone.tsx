'use client'
import { useRef, useState } from 'react'
import { FileIcon, ImageIcon, Loader2, Upload } from 'lucide-react'
import { useUploadThing } from '@/lib/uploadthing'
import { formatFileSize, getFileType } from '@/lib/utils'

interface UploadZoneProps {
  endpoint: 'imageUploader' | 'fileUploader'
  onUploadComplete: (data: { url: string; name: string; size: string; fileType: string }) => void
  label?: string
  hint?: string
}

export function UploadZone({ endpoint, onUploadComplete, label, hint }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        const f = res[0]
        onUploadComplete({
          url: f.ufsUrl ?? f.url,
          name: f.name,
          size: formatFileSize(f.size),
          fileType: getFileType(f.type ?? '', f.name),
        })
      }
      setUploading(false)
      setProgress(0)
    },
    onUploadProgress: (p) => setProgress(p),
    onUploadError: () => { setUploading(false); setProgress(0) },
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    startUpload(files)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  const Icon = endpoint === 'imageUploader' ? ImageIcon : FileIcon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !uploading && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
      className={`border-2 border-dashed border-brand-light-gray p-8 text-center bg-gray-50 transition-colors select-none ${
        uploading
          ? 'cursor-default'
          : 'cursor-pointer hover:border-brand-blue hover:bg-blue-50/20'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={endpoint === 'imageUploader' ? 'image/jpeg,image/png,image/webp' : undefined}
        onChange={handleChange}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="text-brand-blue animate-spin" size={30} />
          <p className="text-sm font-bold text-brand-dark-gray">{progress}% hochgeladen…</p>
          <div className="w-full max-w-xs bg-brand-light-gray h-1.5 mt-1">
            <div
              className="bg-brand-blue h-1.5 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="text-brand-gray" size={28} />
          <p className="text-sm font-bold text-brand-dark-gray">
            {label ?? 'Klicken zum Hochladen'}
          </p>
          {hint && <p className="text-xs text-brand-dark-gray/60">{hint}</p>}
        </div>
      )}
    </div>
  )
}
