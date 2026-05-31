'use client'
import { useState } from 'react'
import { Download, FileText, AlertCircle, Lock } from 'lucide-react'
import { logAndGetDownloadUrl } from '@/lib/actions/downloads'
import type { Download as DownloadType } from '@/lib/types'

interface DownloadCatalogProps {
  downloads: DownloadType[]
  isLoggedIn: boolean
}

export function DownloadCatalog({ downloads, isLoggedIn }: DownloadCatalogProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(id: string) {
    setError(null)
    setLoading(id)
    try {
      const result = await logAndGetDownloadUrl(id)
      if (result.error) setError(result.error)
      else if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Fehler beim Herunterladen')
    } finally {
      setLoading(null)
    }
  }

  if (downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-brand-gray/50">
        <FileText size={36} strokeWidth={1.5} className="mb-3" />
        <p className="text-sm">Keine Downloads verfügbar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {!isLoggedIn && (
        <div className="flex items-center gap-3 bg-brand-dark-blue/5 border border-brand-dark-blue/15 px-5 py-4">
          <Lock size={15} className="text-brand-blue shrink-0" />
          <p className="text-sm text-brand-dark-blue font-bold">
            Bitte melden Sie sich an, um Dateien herunterzuladen.
          </p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-dark-blue/15 text-left">
              <th className="pb-3 pr-4 font-bold text-xs tracking-widest uppercase text-brand-gray/60">Bezeichnung</th>
              <th className="pb-3 pr-4 font-bold text-xs tracking-widest uppercase text-brand-gray/60 w-24">Typ</th>
              <th className="pb-3 pr-4 font-bold text-xs tracking-widest uppercase text-brand-gray/60 w-28">Größe</th>
              <th className="pb-3 pr-4 font-bold text-xs tracking-widest uppercase text-brand-gray/60 w-28">Version</th>
              <th className="pb-3 font-bold text-xs tracking-widest uppercase text-brand-gray/60 w-36 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light-gray/60">
            {downloads.map((dl) => (
              <tr key={dl.id} className="group hover:bg-brand-surface transition-colors">
                <td className="py-4 pr-4 font-bold text-brand-dark-gray">{dl.name}</td>
                <td className="py-4 pr-4">
                  <span className="inline-block bg-brand-dark-blue/8 text-brand-dark-blue px-2.5 py-0.5 text-xs font-bold tracking-wide">
                    {dl.file_type}
                  </span>
                </td>
                <td className="py-4 pr-4 text-brand-gray">{dl.file_size}</td>
                <td className="py-4 pr-4 text-brand-gray">{dl.version}</td>
                <td className="py-4 text-right">
                  {isLoggedIn ? (
                    <button
                      onClick={() => handleDownload(dl.id)}
                      disabled={loading === dl.id}
                      className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-dark-blue text-white text-xs font-bold px-4 py-2 transition-colors disabled:opacity-50"
                    >
                      <Download size={12} />
                      {loading === dl.id ? 'Lädt…' : 'Download'}
                    </button>
                  ) : (
                    <span className="text-xs text-brand-gray/50 italic">Anmeldung nötig</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {downloads.map((dl) => (
          <div key={dl.id} className="bg-brand-surface border border-brand-light-gray/60 p-4">
            <p className="font-bold text-brand-dark-gray text-sm mb-2">{dl.name}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-brand-dark-blue/8 text-brand-dark-blue px-2 py-0.5 text-xs font-bold">{dl.file_type}</span>
              <span className="text-xs text-brand-gray">{dl.file_size}</span>
              <span className="text-xs text-brand-gray">{dl.version}</span>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => handleDownload(dl.id)}
                disabled={loading === dl.id}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-dark-blue text-white text-xs font-bold py-2.5 transition-colors disabled:opacity-50"
              >
                <Download size={12} />
                {loading === dl.id ? 'Lädt…' : 'Herunterladen'}
              </button>
            ) : (
              <p className="text-xs text-brand-gray/50 italic text-center">Anmeldung erforderlich</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
