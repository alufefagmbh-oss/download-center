'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Pencil } from 'lucide-react'
import { moveProduct } from '@/lib/actions/products'
import type { Manufacturer, ProductType } from '@/lib/types'

interface Props {
  manufacturers: Manufacturer[]
  products: ProductType[]
}

function ProductCard({
  product,
  manufacturerId,
}: {
  product: ProductType
  manufacturerId: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: product.id,
    data: { manufacturerId },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white border border-brand-light-gray px-4 py-3 group ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <button
        {...listeners}
        {...attributes}
        className="text-brand-gray hover:text-brand-dark-gray cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Verschieben"
      >
        <GripVertical size={14} />
      </button>

      {product.image_url ? (
        <div className="relative w-8 h-8 shrink-0 overflow-hidden bg-gray-100">
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="32px" />
        </div>
      ) : (
        <div className="w-8 h-8 shrink-0 bg-brand-light-gray" />
      )}

      <span className="flex-1 text-sm font-bold text-brand-dark-gray truncate">{product.name}</span>

      <Link
        href={`/admin/products/${product.id}`}
        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark-blue font-bold transition-opacity shrink-0"
      >
        <Pencil size={11} /> Downloads
      </Link>
    </div>
  )
}

function ManufacturerColumn({
  manufacturer,
  products,
}: {
  manufacturer: Manufacturer
  products: ProductType[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: manufacturer.id })

  return (
    <div className="flex flex-col min-w-72 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-brand-dark-gray">{manufacturer.name}</h3>
          <p className="text-xs text-brand-gray">{products.length} Produkt(e)</p>
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
          isOver ? 'border-brand-blue bg-blue-50' : 'border-brand-light-gray bg-gray-50'
        }`}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} manufacturerId={manufacturer.id} />
        ))}
        {products.length === 0 && (
          <p className="text-xs text-brand-gray text-center py-4">Kein Produkt</p>
        )}
      </div>
    </div>
  )
}

function DragPreview({ product }: { product: ProductType }) {
  return (
    <div className="flex items-center gap-3 bg-white border-2 border-brand-blue px-4 py-3 shadow-lg opacity-90 rotate-1">
      <GripVertical size={14} className="text-brand-gray" />
      <span className="text-sm font-bold text-brand-dark-gray">{product.name}</span>
    </div>
  )
}

export function ProductsBoard({ manufacturers, products: initialProducts }: Props) {
  const [products, setProducts] = useState<ProductType[]>(initialProducts)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const productsByManufacturer = useCallback(
    (mId: string) => products.filter((p) => p.manufacturer_id === mId),
    [products]
  )

  const draggingProduct = draggingId ? products.find((p) => p.id === draggingId) : null

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null)
    const { active, over } = event
    if (!over) return

    const productId = active.id as string
    const newManufacturerId = over.id as string
    const product = products.find((p) => p.id === productId)
    if (!product || product.manufacturer_id === newManufacturerId) return

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, manufacturer_id: newManufacturerId } : p
      )
    )

    const result = await moveProduct(productId, newManufacturerId)

    if (!result.success) {
      // Revert
      setProducts(initialProducts)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {manufacturers.map((m) => (
          <ManufacturerColumn
            key={m.id}
            manufacturer={m}
            products={productsByManufacturer(m.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {draggingProduct ? <DragPreview product={draggingProduct} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
