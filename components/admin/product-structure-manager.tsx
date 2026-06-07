'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Layers,
} from 'lucide-react'
import { createSection, updateSection, deleteSection, reorderSections } from '@/lib/actions/sections'
import { createGroup, updateGroup, deleteGroup, reorderGroups } from '@/lib/actions/groups'
import { reorderDownloads } from '@/lib/actions/downloads'
import type { DownloadSection, DownloadGroup, Download } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupWithFiles extends DownloadGroup {
  downloads: Download[]
}

interface SectionWithGroups extends DownloadSection {
  groups: GroupWithFiles[]
}

interface Props {
  sections: SectionWithGroups[]
  looseGroups: GroupWithFiles[]
  standaloneFiles: Download[]
  productTypeId: string
  manufacturerId: string
}

// ── Inline editor for names ────────────────────────────────────────────────────

function InlineEditor({
  value,
  onSave,
  onCancel,
  placeholder,
}: {
  value: string
  onSave: (name: string) => void
  onCancel: () => void
  placeholder?: string
}) {
  const [name, setName] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); if (name.trim()) onSave(name.trim()) }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      <input
        ref={ref}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="flex-1 border border-brand-blue px-2 py-1 text-sm font-bold focus:outline-none min-w-0"
      />
      <button
        onClick={() => name.trim() && onSave(name.trim())}
        disabled={!name.trim()}
        className="text-green-600 hover:text-green-700 disabled:opacity-40 shrink-0"
      >
        <Check size={14} />
      </button>
      <button onClick={onCancel} className="text-red-500 hover:text-red-600 shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

// ── New-item input ─────────────────────────────────────────────────────────────

function AddForm({
  onAdd,
  onCancel,
  placeholder,
}: {
  onAdd: (name: string) => void
  onCancel: () => void
  placeholder: string
}) {
  const [name, setName] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); if (name.trim()) onAdd(name.trim()) }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        ref={ref}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="flex-1 border border-brand-blue px-2 py-1 text-sm focus:outline-none min-w-0"
      />
      <button
        onClick={() => name.trim() && onAdd(name.trim())}
        disabled={!name.trim()}
        className="text-green-600 hover:text-green-700 disabled:opacity-40 shrink-0"
      >
        <Check size={14} />
      </button>
      <button onClick={onCancel} className="text-red-500 hover:text-red-600 shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

// ── Sortable file row (inside a group) ────────────────────────────────────────

function SortableFileRow({
  dl,
  manufacturerId,
  productTypeId,
}: {
  dl: Download
  manufacturerId: string
  productTypeId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dl.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 px-3 py-2 border-t border-brand-light-gray/60 bg-white group touch-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <button
        {...listeners}
        {...attributes}
        className="text-brand-gray/30 hover:text-brand-gray cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Verschieben"
      >
        <GripVertical size={12} />
      </button>
      <FileText size={12} className="text-brand-gray/40 shrink-0" />
      <span className="flex-1 text-xs text-brand-dark-gray truncate">{dl.name}</span>
      <span className="text-xs text-brand-gray/50 shrink-0">{dl.file_type}</span>
      <span className="text-xs text-brand-gray/40 shrink-0">{dl.file_size}</span>
      <Link
        href={`/admin/manufacturers/${manufacturerId}/products/${productTypeId}/downloads/${dl.id}`}
        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold shrink-0"
      >
        <Pencil size={11} />
      </Link>
    </div>
  )
}

// ── Group item (expandable, with sortable files) ───────────────────────────────

function GroupItem({
  group,
  manufacturerId,
  productTypeId,
  onUpdated,
}: {
  group: GroupWithFiles
  manufacturerId: string
  productTypeId: string
  onUpdated: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  const initialIds = group.downloads.map((d) => d.id)
  const idsKey = initialIds.join(',')
  const [fileIds, setFileIds] = useState(initialIds)
  const fileIdsRef = useRef(fileIds)
  useEffect(() => { fileIdsRef.current = fileIds }, [fileIds])
  useEffect(() => { setFileIds(initialIds) }, [idsKey])  // sync when prop changes

  const fileMap = Object.fromEntries(group.downloads.map((d) => [d.id, d]))

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleFileDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const ids = fileIdsRef.current
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    if (from < 0 || to < 0 || from === to) return
    const newIds = arrayMove(ids, from, to)
    setFileIds(newIds)
    const result = await reorderDownloads(newIds, productTypeId, manufacturerId)
    if (!result.success) setFileIds(initialIds)
  }

  async function handleDelete() {
    if (!confirm(`Gruppe "${group.name}" und alle Dateien darin löschen?`)) return
    await deleteGroup(group.id, productTypeId, manufacturerId)
    onUpdated()
  }

  async function handleEditSave(name: string) {
    await updateGroup(group.id, productTypeId, manufacturerId, name)
    setEditing(false)
    onUpdated()
  }

  return (
    <div className="border border-brand-light-gray bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 group/header">
        <button onClick={() => setExpanded((e) => !e)} className="text-brand-gray/50 hover:text-brand-gray shrink-0">
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>

        {editing ? (
          <InlineEditor
            value={group.name}
            onSave={handleEditSave}
            onCancel={() => setEditing(false)}
            placeholder="Gruppenname"
          />
        ) : (
          <>
            <Folder size={13} className="text-brand-blue shrink-0" />
            <span className="flex-1 text-sm font-bold text-brand-dark-gray min-w-0 truncate">{group.name}</span>
            <span className="text-xs text-brand-gray/50 shrink-0">{group.downloads.length} Datei(en)</span>
            <div className="opacity-0 group-hover/header:opacity-100 flex items-center gap-2 shrink-0">
              <button onClick={() => setEditing(true)} className="text-brand-blue hover:text-brand-dark-blue">
                <Pencil size={12} />
              </button>
              <button onClick={handleDelete} className="text-red-400 hover:text-red-600">
                <Trash2 size={12} />
              </button>
            </div>
          </>
        )}
      </div>

      {expanded && (
        <div className="border-t border-brand-light-gray/60">
          {fileIds.length > 0 ? (
            <DndContext sensors={sensors} onDragEnd={handleFileDragEnd}>
              <SortableContext items={fileIds} strategy={verticalListSortingStrategy}>
                {fileIds.map((id) => {
                  const dl = fileMap[id]
                  return dl ? (
                    <SortableFileRow
                      key={id}
                      dl={dl}
                      manufacturerId={manufacturerId}
                      productTypeId={productTypeId}
                    />
                  ) : null
                })}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="px-3 py-2 text-xs text-brand-gray/50 italic">Keine Dateien in dieser Gruppe.</p>
          )}
          <div className="px-3 py-2 border-t border-brand-light-gray/60">
            <Link
              href={`/admin/manufacturers/${manufacturerId}/products/${productTypeId}/downloads/new?groupId=${group.id}`}
              className="inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold"
            >
              <Plus size={11} /> Datei hinzufügen
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sortable group wrapper (drag handle + GroupItem) ──────────────────────────

function SortableGroupItem({
  group,
  manufacturerId,
  productTypeId,
  onUpdated,
}: {
  group: GroupWithFiles
  manufacturerId: string
  productTypeId: string
  onUpdated: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-1 touch-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <button
        {...listeners}
        {...attributes}
        className="mt-2.5 text-brand-gray/30 hover:text-brand-gray cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Gruppe verschieben"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <GroupItem
          group={group}
          manufacturerId={manufacturerId}
          productTypeId={productTypeId}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  )
}

// ── Groups list (sortable, with add button) ───────────────────────────────────

function GroupsList({
  groups: initialGroups,
  sectionId,
  productTypeId,
  manufacturerId,
  onUpdated,
}: {
  groups: GroupWithFiles[]
  sectionId: string | null
  productTypeId: string
  manufacturerId: string
  onUpdated: () => void
}) {
  const idsKey = initialGroups.map((g) => g.id).join(',')
  const [groupIds, setGroupIds] = useState(() => initialGroups.map((g) => g.id))
  const groupIdsRef = useRef(groupIds)
  useEffect(() => { groupIdsRef.current = groupIds }, [groupIds])
  useEffect(() => { setGroupIds(initialGroups.map((g) => g.id)) }, [idsKey])

  const [adding, setAdding] = useState(false)
  const groupMap = Object.fromEntries(initialGroups.map((g) => [g.id, g]))
  const initialIds = initialGroups.map((g) => g.id)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const ids = groupIdsRef.current
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    if (from < 0 || to < 0 || from === to) return
    const newIds = arrayMove(ids, from, to)
    setGroupIds(newIds)
    const result = await reorderGroups(newIds, productTypeId, manufacturerId)
    if (!result.success) setGroupIds(initialIds)
  }

  async function handleAdd(name: string) {
    await createGroup(productTypeId, manufacturerId, name, sectionId)
    setAdding(false)
    onUpdated()
  }

  return (
    <div className="space-y-1">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
          {groupIds.map((id) => {
            const group = groupMap[id]
            return group ? (
              <SortableGroupItem
                key={id}
                group={group}
                manufacturerId={manufacturerId}
                productTypeId={productTypeId}
                onUpdated={onUpdated}
              />
            ) : null
          })}
        </SortableContext>
      </DndContext>

      {adding ? (
        <AddForm onAdd={handleAdd} onCancel={() => setAdding(false)} placeholder="Gruppenname..." />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold mt-1"
        >
          <Plus size={11} /> Neue Gruppe
        </button>
      )}
    </div>
  )
}

// ── Sortable section item ─────────────────────────────────────────────────────

function SortableSectionItem({
  section,
  productTypeId,
  manufacturerId,
  onUpdated,
}: {
  section: SectionWithGroups
  productTypeId: string
  manufacturerId: string
  onUpdated: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
    if (!confirm(`Bereich "${section.name}" und alle seine Gruppen löschen?`)) return
    await deleteSection(section.id, productTypeId, manufacturerId)
    onUpdated()
  }

  async function handleEditSave(name: string) {
    await updateSection(section.id, productTypeId, manufacturerId, name)
    setEditing(false)
    onUpdated()
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border-2 border-brand-dark-blue/20 ${isDragging ? 'opacity-30' : ''}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-dark-blue/5 group/sec">
        <button
          {...listeners}
          {...attributes}
          className="text-brand-gray/30 hover:text-brand-gray cursor-grab active:cursor-grabbing touch-none shrink-0"
          aria-label="Bereich verschieben"
        >
          <GripVertical size={14} />
        </button>
        <button onClick={() => setExpanded((e) => !e)} className="text-brand-gray/50 hover:text-brand-gray shrink-0">
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>

        {editing ? (
          <InlineEditor
            value={section.name}
            onSave={handleEditSave}
            onCancel={() => setEditing(false)}
            placeholder="Bereichsname"
          />
        ) : (
          <>
            <Layers size={13} className="text-brand-dark-blue shrink-0" />
            <span className="flex-1 text-sm font-bold text-brand-dark-blue uppercase tracking-wide min-w-0 truncate">
              {section.name}
            </span>
            <span className="text-xs text-brand-gray/50 shrink-0">{section.groups.length} Gruppe(n)</span>
            <div className="opacity-0 group-hover/sec:opacity-100 flex items-center gap-2 shrink-0">
              <button onClick={() => setEditing(true)} className="text-brand-blue hover:text-brand-dark-blue">
                <Pencil size={12} />
              </button>
              <button onClick={handleDelete} className="text-red-400 hover:text-red-600">
                <Trash2 size={12} />
              </button>
            </div>
          </>
        )}
      </div>

      {expanded && (
        <div className="p-3 bg-brand-surface/40">
          <GroupsList
            groups={section.groups}
            sectionId={section.id}
            productTypeId={productTypeId}
            manufacturerId={manufacturerId}
            onUpdated={onUpdated}
          />
        </div>
      )}
    </div>
  )
}

// ── Standalone file row ───────────────────────────────────────────────────────

function SortableStandaloneRow({
  dl,
  manufacturerId,
  productTypeId,
}: {
  dl: Download
  manufacturerId: string
  productTypeId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dl.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 px-3 py-2.5 bg-white border border-brand-light-gray group touch-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <button
        {...listeners}
        {...attributes}
        className="text-brand-gray/30 hover:text-brand-gray cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Verschieben"
      >
        <GripVertical size={12} />
      </button>
      <FileText size={13} className="text-brand-gray/50 shrink-0" />
      <span className="flex-1 text-sm text-brand-dark-gray min-w-0 truncate">{dl.name}</span>
      <span className="text-xs text-brand-gray/50 shrink-0">{dl.file_type}</span>
      <span className="text-xs text-brand-gray/40 shrink-0">{dl.file_size}</span>
      <Link
        href={`/admin/manufacturers/${manufacturerId}/products/${productTypeId}/downloads/${dl.id}`}
        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold shrink-0"
      >
        <Pencil size={11} /> Bearbeiten
      </Link>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ProductStructureManager({
  sections: initialSections,
  looseGroups: initialLooseGroups,
  standaloneFiles: initialStandaloneFiles,
  productTypeId,
  manufacturerId,
}: Props) {
  const router = useRouter()

  function handleUpdated() {
    router.refresh()
  }

  // ─ Sections DnD ─
  const sectionIdsKey = initialSections.map((s) => s.id).join(',')
  const [sectionIds, setSectionIds] = useState(() => initialSections.map((s) => s.id))
  const sectionIdsRef = useRef(sectionIds)
  useEffect(() => { sectionIdsRef.current = sectionIds }, [sectionIds])
  useEffect(() => { setSectionIds(initialSections.map((s) => s.id)) }, [sectionIdsKey])

  const [addingSection, setAddingSection] = useState(false)
  const sectionMap = Object.fromEntries(initialSections.map((s) => [s.id, s]))
  const initialSectionIds = initialSections.map((s) => s.id)

  const sectionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleSectionDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const ids = sectionIdsRef.current
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    if (from < 0 || to < 0 || from === to) return
    const newIds = arrayMove(ids, from, to)
    setSectionIds(newIds)
    const result = await reorderSections(newIds, productTypeId, manufacturerId)
    if (!result.success) setSectionIds(initialSectionIds)
  }

  async function handleAddSection(name: string) {
    await createSection(productTypeId, manufacturerId, name)
    setAddingSection(false)
    handleUpdated()
  }

  // ─ Standalone files DnD ─
  const standaloneIdsKey = initialStandaloneFiles.map((d) => d.id).join(',')
  const [standaloneIds, setStandaloneIds] = useState(() => initialStandaloneFiles.map((d) => d.id))
  const standaloneIdsRef = useRef(standaloneIds)
  useEffect(() => { standaloneIdsRef.current = standaloneIds }, [standaloneIds])
  useEffect(() => { setStandaloneIds(initialStandaloneFiles.map((d) => d.id)) }, [standaloneIdsKey])

  const standaloneMap = Object.fromEntries(initialStandaloneFiles.map((d) => [d.id, d]))
  const initialStandaloneIds = initialStandaloneFiles.map((d) => d.id)

  const standaloneSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleStandaloneDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const ids = standaloneIdsRef.current
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    if (from < 0 || to < 0 || from === to) return
    const newIds = arrayMove(ids, from, to)
    setStandaloneIds(newIds)
    const result = await reorderDownloads(newIds, productTypeId, manufacturerId)
    if (!result.success) setStandaloneIds(initialStandaloneIds)
  }

  const totalFiles =
    initialSections.reduce((acc, s) => acc + s.groups.reduce((a, g) => a + g.downloads.length, 0), 0) +
    initialLooseGroups.reduce((acc, g) => acc + g.downloads.length, 0) +
    initialStandaloneFiles.length

  return (
    <div className="space-y-8">
      {/* ── Bereiche ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-brand-dark-gray">Downloads & Struktur</h2>
            <p className="text-sm text-brand-gray">{totalFiles} Datei(en) gesamt</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-brand-gray uppercase tracking-wider">Bereiche</p>
            <button
              onClick={() => setAddingSection(true)}
              className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold"
            >
              <Plus size={11} /> Neuer Bereich
            </button>
          </div>

          <DndContext sensors={sectionSensors} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sectionIds.map((id) => {
                  const section = sectionMap[id]
                  return section ? (
                    <SortableSectionItem
                      key={id}
                      section={section}
                      productTypeId={productTypeId}
                      manufacturerId={manufacturerId}
                      onUpdated={handleUpdated}
                    />
                  ) : null
                })}
              </div>
            </SortableContext>
          </DndContext>

          {addingSection && (
            <AddForm
              onAdd={handleAddSection}
              onCancel={() => setAddingSection(false)}
              placeholder="Bereichsname eingeben..."
            />
          )}

          {sectionIds.length === 0 && !addingSection && (
            <div className="border-2 border-dashed border-brand-light-gray py-5 text-center mt-2">
              <p className="text-xs text-brand-gray/60">Noch keine Bereiche.</p>
            </div>
          )}
        </div>

        {/* ── Lose Gruppen ── */}
        <div className="mb-4">
          <p className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">Lose Gruppen</p>
          <GroupsList
            groups={initialLooseGroups}
            sectionId={null}
            productTypeId={productTypeId}
            manufacturerId={manufacturerId}
            onUpdated={handleUpdated}
          />
          {initialLooseGroups.length === 0 && (
            <div className="border-2 border-dashed border-brand-light-gray py-4 text-center mt-2">
              <p className="text-xs text-brand-gray/60">Keine losen Gruppen.</p>
            </div>
          )}
        </div>

        {/* ── Standalone Dateien ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-brand-gray uppercase tracking-wider">Standalone Dateien</p>
            <Link
              href={`/admin/manufacturers/${manufacturerId}/products/${productTypeId}/downloads/new`}
              className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold"
            >
              <Plus size={11} /> Neue Datei
            </Link>
          </div>

          <DndContext sensors={standaloneSensors} onDragEnd={handleStandaloneDragEnd}>
            <SortableContext items={standaloneIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {standaloneIds.map((id) => {
                  const dl = standaloneMap[id]
                  return dl ? (
                    <SortableStandaloneRow
                      key={id}
                      dl={dl}
                      manufacturerId={manufacturerId}
                      productTypeId={productTypeId}
                    />
                  ) : null
                })}
              </div>
            </SortableContext>
          </DndContext>

          {standaloneIds.length === 0 && (
            <div className="border-2 border-dashed border-brand-light-gray py-4 text-center mt-1">
              <p className="text-xs text-brand-gray/60">Keine Standalone-Dateien.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
