'use client'
import { useState } from 'react'
import { Download, FileText, Lock, ChevronRight, ChevronDown, FolderOpen, Layers } from 'lucide-react'
import type { DownloadSection, DownloadGroup, Download as DownloadType } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupWithFiles extends DownloadGroup {
  downloads: DownloadType[]
}

interface SectionWithGroups extends DownloadSection {
  groups: GroupWithFiles[]
}

interface Props {
  sections: SectionWithGroups[]
  looseGroups: GroupWithFiles[]
  standaloneFiles: DownloadType[]
  isLoggedIn: boolean
}

// ── File action button ─────────────────────────────────────────────────────────

function FileAction({ dl, isLoggedIn }: { dl: DownloadType; isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <span className="text-xs text-brand-gray/40 italic">Anmeldung nötig</span>
  }
  const isPdf = dl.file_type?.toUpperCase() === 'PDF'
  if (isPdf) {
    return (
      <a
        href={`/api/download/${dl.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-dark-blue text-white text-xs font-bold px-3 py-1.5 transition-colors"
      >
        <FileText size={11} /> Öffnen
      </a>
    )
  }
  return (
    <a
      href={`/api/download/${dl.id}`}
      className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-dark-blue text-white text-xs font-bold px-3 py-1.5 transition-colors"
    >
      <Download size={11} /> Download
    </a>
  )
}

// ── Download all button (JS-based multi-download) ─────────────────────────────

function DownloadAllButton({ group, isLoggedIn }: { group: GroupWithFiles; isLoggedIn: boolean }) {
  if (!isLoggedIn || group.downloads.length === 0) return null

  function handleDownloadAll() {
    group.downloads.forEach((dl, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = `/api/download/${dl.id}`
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, i * 400)
    })
  }

  return (
    <button
      onClick={handleDownloadAll}
      className="inline-flex items-center gap-1.5 bg-brand-dark-blue/10 hover:bg-brand-dark-blue hover:text-white text-brand-dark-blue text-xs font-bold px-3 py-1.5 transition-colors"
    >
      <Download size={11} /> Alle herunterladen
    </button>
  )
}

// ── Files table (inside a group or standalone) ────────────────────────────────

function FilesTable({ downloads, isLoggedIn }: { downloads: DownloadType[]; isLoggedIn: boolean }) {
  if (downloads.length === 0) return null

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-brand-light-gray/60 text-left">
              <th className="pb-2 pr-4 font-bold text-xs tracking-wider uppercase text-brand-gray/50">Bezeichnung</th>
              <th className="pb-2 pr-4 font-bold text-xs tracking-wider uppercase text-brand-gray/50 w-20">Typ</th>
              <th className="pb-2 pr-4 font-bold text-xs tracking-wider uppercase text-brand-gray/50 w-24">Größe</th>
              <th className="pb-2 pr-4 font-bold text-xs tracking-wider uppercase text-brand-gray/50 w-24">Version</th>
              <th className="pb-2 font-bold text-xs tracking-wider uppercase text-brand-gray/50 w-32 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light-gray/40">
            {downloads.map((dl) => (
              <tr key={dl.id} className="hover:bg-brand-surface/60 transition-colors">
                <td className="py-3 pr-4 font-bold text-brand-dark-gray">{dl.name}</td>
                <td className="py-3 pr-4">
                  <span className="inline-block bg-brand-dark-blue/8 text-brand-dark-blue px-2 py-0.5 text-xs font-bold">
                    {dl.file_type}
                  </span>
                </td>
                <td className="py-3 pr-4 text-sm text-brand-gray">{dl.file_size}</td>
                <td className="py-3 pr-4 text-sm text-brand-gray">{dl.version}</td>
                <td className="py-3 text-right">
                  <FileAction dl={dl} isLoggedIn={isLoggedIn} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-1.5">
        {downloads.map((dl) => (
          <div key={dl.id} className="bg-white border border-brand-light-gray/60 p-3">
            <p className="font-bold text-brand-dark-gray text-sm mb-1.5">{dl.name}</p>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-brand-dark-blue/8 text-brand-dark-blue px-2 py-0.5 text-xs font-bold">{dl.file_type}</span>
              <span className="text-xs text-brand-gray">{dl.file_size}</span>
              <span className="text-xs text-brand-gray">{dl.version}</span>
            </div>
            <FileAction dl={dl} isLoggedIn={isLoggedIn} />
          </div>
        ))}
      </div>
    </>
  )
}

// ── Group (collapsible) ───────────────────────────────────────────────────────

function GroupView({ group, isLoggedIn }: { group: GroupWithFiles; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-brand-light-gray">
      {/* Group header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-brand-surface/60 transition-colors select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="text-brand-gray/50">
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>
        <FolderOpen size={15} className="text-brand-blue shrink-0" />
        <span className="flex-1 font-bold text-brand-dark-gray text-sm">{group.name}</span>
        <span className="text-xs text-brand-gray/50 shrink-0">{group.downloads.length} Datei(en)</span>
        <div onClick={(e) => e.stopPropagation()}>
          <DownloadAllButton group={group} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      {/* Files */}
      {open && (
        <div className="border-t border-brand-light-gray/60 px-4 py-4">
          <FilesTable downloads={group.downloads} isLoggedIn={isLoggedIn} />
          {group.downloads.length === 0 && (
            <p className="text-sm text-brand-gray/50 italic">Keine Dateien in dieser Gruppe.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function GroupedDownloadCatalog({ sections, looseGroups, standaloneFiles, isLoggedIn }: Props) {
  const hasContent =
    sections.length > 0 ||
    looseGroups.length > 0 ||
    standaloneFiles.length > 0

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-brand-gray/50">
        <FileText size={36} strokeWidth={1.5} className="mb-3" />
        <p className="text-sm">Keine Downloads verfügbar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isLoggedIn && (
        <div className="flex items-center gap-3 bg-brand-dark-blue/5 border border-brand-dark-blue/15 px-5 py-4">
          <Lock size={15} className="text-brand-blue shrink-0" />
          <p className="text-sm text-brand-dark-blue font-bold">
            Bitte melden Sie sich an, um Dateien herunterzuladen.
          </p>
        </div>
      )}

      {/* Bereiche */}
      {sections.map((section) => (
        <div key={section.id}>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-brand-dark-blue" />
            <h3 className="text-xs font-bold text-brand-dark-blue uppercase tracking-widest">
              {section.name}
            </h3>
            <div className="flex-1 h-px bg-brand-dark-blue/15" />
          </div>
          <div className="space-y-2">
            {section.groups.map((group) => (
              <GroupView key={group.id} group={group} isLoggedIn={isLoggedIn} />
            ))}
            {section.groups.length === 0 && (
              <p className="text-sm text-brand-gray/50 italic pl-2">Keine Gruppen in diesem Bereich.</p>
            )}
          </div>
        </div>
      ))}

      {/* Lose Gruppen */}
      {looseGroups.length > 0 && (
        <div className="space-y-2">
          {looseGroups.map((group) => (
            <GroupView key={group.id} group={group} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}

      {/* Standalone Dateien */}
      {standaloneFiles.length > 0 && (
        <div>
          {(sections.length > 0 || looseGroups.length > 0) && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-brand-light-gray" />
              <span className="text-xs text-brand-gray/50 uppercase tracking-wider">Weitere Dokumente</span>
              <div className="flex-1 h-px bg-brand-light-gray" />
            </div>
          )}
          <FilesTable downloads={standaloneFiles} isLoggedIn={isLoggedIn} />
        </div>
      )}
    </div>
  )
}
