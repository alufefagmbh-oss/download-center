'use client'
import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  action: () => Promise<unknown>
  label?: string
  confirmMessage?: string
}

export function DeleteButton({
  action,
  label = 'Löschen',
  confirmMessage = 'Wirklich löschen?',
}: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs text-red-600 font-bold mr-1">Sicher?</span>
        <button
          type="button"
          className="text-xs font-bold text-red-600 hover:text-red-800 underline"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await action()
            })
          }}
        >
          {isPending ? 'Lädt...' : 'Ja, löschen'}
        </button>
        <span className="text-brand-light-gray mx-1">|</span>
        <button
          type="button"
          className="text-xs text-brand-gray hover:text-brand-dark-gray"
          onClick={() => setConfirming(false)}
        >
          Abbrechen
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
      onClick={() => setConfirming(true)}
    >
      <Trash2 size={12} /> {label}
    </button>
  )
}
