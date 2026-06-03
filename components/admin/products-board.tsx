'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Pencil } from 'lucide-react'
import { moveProduct, reorderProducts } from '@/lib/actions/products'
import type { Manufacturer, ProductType } from '@/lib/types'

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  manufacturers: Manufacturer[]
  products: ProductType[]
}

type ColumnItems = Record<string, string[]> // manufacturerId → productId[]

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildColumnItems(manufacturers: Manufacturer[], products: ProductType[]): ColumnItems {
  const map: ColumnItems = {}
  for (const m of manufacturers) {
    map[m.id] = products
      .filter((p) => p.manufacturer_id === m.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((p) => p.id)
  }
  return map
}

// ── Product card (sortable) ───────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white border border-brand-light-gray px-4 py-3 group touch-none ${
        isDragging ? 'opacity-30 shadow-lg' : ''
      }`}
    >
      <button
        {...listeners}
        {...attributes}
        className="text-brand-gray hover:text-brand-dark-gray cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Reihenfolge ändern"
      >
        <GripVertical size={14} />
      </button>

      {product.image_url ? (
        <div className="relative w-8 h-8 shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      ) : (
        <div className="w-8 h-8 shrink-0 bg-brand-light-gray" />
      )}

      <span className="flex-1 text-sm font-bold text-brand-dark-gray truncate">
        {product.name}
      </span>

      <Link
        href={`/admin/products/${product.id}`}
        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold transition-opacity shrink-0"
      >
        <Pencil size={11} /> Downloads
      </Link>
    </div>
  )
}

// ── Manufacturer column ───────────────────────────────────────────────────────

function ManufacturerColumn({
  manufacturer,
  productIds,
  productMap,
  isActive,
}: {
  manufacturer: Manufacturer
  productIds: string[]
  productMap: Record<string, ProductType>
  isActive: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: manufacturer.id })

  return (
    <div className="flex flex-col min-w-72 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-brand-dark-gray">{manufacturer.name}</h3>
          <p className="text-xs text-brand-gray">{productIds.length} Produkt(e)</p>
        </div>
        <Link
          href={`/admin/manufacturers/${manufacturer.id}/products/new`}
          className="inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold"
        >
          <Plus size={12} /> Neu
        </Link>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 min-h-24 p-2 border-2 border-dashed transition-colors ${
          isOver || (isActive && productIds.length === 0)
            ? 'border-brand-blue bg-blue-50'
            : 'border-brand-light-gray bg-gray-50'
        }`}
      >
        <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
          {productIds.map((id) => {
            const product = productMap[id]
            return product ? <ProductCard key={id} product={product} /> : null
          })}
        </SortableContext>
        {productIds.length === 0 && (
          <p className="text-xs text-brand-gray text-center py-4">Kein Produkt</p>
        )}
      </div>
    </div>
  )
}

// ── Drag overlay preview ──────────────────────────────────────────────────────

function DragPreview({ product }: { product: ProductType }) {
  return (
    <div className="flex items-center gap-3 bg-white border-2 border-brand-blue px-4 py-3 shadow-xl opacity-95 rotate-1 min-w-64">
      <GripVertical size={14} className="text-brand-gray" />
      {product.image_url && (
        <div className="relative w-8 h-8 shrink-0 overflow-hidden bg-gray-100">
          <Image src={product.image_url} alt="" fill className="object-cover" sizes="32px" />
        </div>
      )}
      <span className="text-sm font-bold text-brand-dark-gray">{product.name}</span>
    </div>
  )
}

// ── Board ─────────────────────────────────────────────────────────────────────

export function ProductsBoard({ manufacturers, products: initialProducts }: Props) {
  const productMap = Object.fromEntries(initialProducts.map((p) => [p.id, p]))

  const initialColumns = buildColumnItems(manufacturers, initialProducts)
  const [columnItems, setColumnItems] = useState<ColumnItems>(initialColumns)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Keep a ref in sync for use in event handlers (avoids stale closures)
  const columnItemsRef = useRef(columnItems)
  useEffect(() => { columnItemsRef.current = columnItems }, [columnItems])

  const activeContainerRef = useRef<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function findContainer(id: string): string | undefined {
    const items = columnItemsRef.current
    if (id in items) return id
    for (const [cId, ids] of Object.entries(items)) {
      if (ids.includes(id)) return cId
    }
    return undefined
  }

  function handleDragStart({ active }: DragStartEvent) {
    const id = active.id as string
    setDraggingId(id)
    activeContainerRef.current = findContainer(id) ?? null
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    // overId can be a product id or a manufacturer id (column droppable)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    // Cross-container move: live preview
    setColumnItems((prev) => {
      const activeIds = [...prev[activeContainer]]
      const overIds = [...prev[overContainer]]

      const activeIndex = activeIds.indexOf(activeId)
      const overIndex = overIds.indexOf(overId)

      activeIds.splice(activeIndex, 1)
      // Insert after the hovered item (or at end if hovering the container itself)
      const insertAt = overIndex < 0 ? overIds.length : overIndex + 1
      overIds.splice(insertAt, 0, activeId)

      return { ...prev, [activeContainer]: activeIds, [overContainer]: overIds }
    })
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null)
    const originalContainer = activeContainerRef.current
    activeContainerRef.current = null

    if (!over || !originalContainer) {
      setColumnItems(initialColumns)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string
    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer) {
      setColumnItems(initialColumns)
      return
    }

    if (activeContainer === overContainer) {
      // Same column — reorder
      const ids = [...columnItemsRef.current[activeContainer]]
      const from = ids.indexOf(activeId)
      const to = ids.indexOf(overId)

      if (from !== to && to >= 0) {
        const newIds = arrayMove(ids, from, to)
        setColumnItems((prev) => ({ ...prev, [activeContainer]: newIds }))
        const result = await reorderProducts(newIds)
        if (!result.success) setColumnItems(initialColumns)
      }
    } else if (overContainer) {
      // Cross-column move was already applied optimistically in onDragOver
      // Persist: update manufacturer + reorder destination
      const movedToNew = originalContainer !== overContainer
      if (movedToNew) {
        const moveResult = await moveProduct(activeId, overContainer)
        if (!moveResult.success) {
          setColumnItems(initialColumns)
          return
        }
      }
      const destIds = columnItemsRef.current[overContainer]
      await reorderProducts(destIds)
    }
  }

  const draggingProduct = draggingId ? productMap[draggingId] : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 items-start">
        {manufacturers.map((m) => (
          <ManufacturerColumn
            key={m.id}
            manufacturer={m}
            productIds={columnItems[m.id] ?? []}
            productMap={productMap}
            isActive={!!draggingId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {draggingProduct ? <DragPreview product={draggingProduct} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
