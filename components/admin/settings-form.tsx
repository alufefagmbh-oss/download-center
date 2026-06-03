'use client'
import { useActionState } from 'react'
import { saveSettings } from '@/lib/actions/settings'
import type { ActionState } from '@/lib/types'

interface Props {
  defaultValues: Record<string, string>
}

export function SettingsForm({ defaultValues }: Props) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    saveSettings,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-brand-dark-gray mb-1.5">
          Benachrichtigungs-E-Mails
        </label>
        <textarea
          name="notification_email"
          defaultValue={defaultValues.notification_email ?? ''}
          placeholder={'admin@beispiel.at\ninfo@beispiel.at'}
          rows={4}
          className="w-full border border-brand-light-gray px-3 py-2 text-sm focus:outline-none focus:border-brand-blue resize-none font-mono"
        />
        <p className="text-xs text-brand-gray mt-1">
          Eine E-Mail-Adresse pro Zeile. Bei jedem neuen Onboarding wird an alle eingetragenen Adressen eine Benachrichtigung gesendet.
        </p>
      </div>

      {state?.message && (
        <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-blue text-white px-5 py-2.5 font-bold hover:bg-brand-dark-blue transition-colors text-sm disabled:opacity-50"
      >
        {pending ? 'Speichern…' : 'Speichern'}
      </button>
    </form>
  )
}
