'use client'
import { useActionState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboarding } from '@/lib/actions/onboarding'

interface OnboardingFormProps {
  defaults?: Record<string, string>
}

export function OnboardingForm({ defaults }: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(completeOnboarding, undefined)

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && !state.success && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          <AlertCircle size={16} />
          <span className="text-sm">{state.message}</span>
        </div>
      )}

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaults?.name ?? ''}
          placeholder="Max Mustermann"
          required
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="firma">Firma *</Label>
        <Input
          id="firma"
          name="firma"
          defaultValue={defaults?.firma ?? ''}
          placeholder="Mustermann GmbH"
          required
        />
        {state?.errors?.firma && (
          <p className="mt-1 text-xs text-red-600">{state.errors.firma[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="position">Position / Funktion *</Label>
        <Input
          id="position"
          name="position"
          defaultValue={defaults?.position ?? ''}
          placeholder="z.B. Einkäufer, Techniker"
          required
        />
        {state?.errors?.position && (
          <p className="mt-1 text-xs text-red-600">{state.errors.position[0]}</p>
        )}
      </div>

      <div className="border-t border-brand-light-gray pt-5">
        <p className="text-xs text-brand-gray mb-4 font-bold uppercase tracking-wide">
          Optionale Angaben
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="telefon">Telefonnummer</Label>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              defaultValue={defaults?.telefon ?? ''}
              placeholder="+43 1 234 5678"
            />
          </div>

          <div>
            <Label htmlFor="uid">UID-Nummer</Label>
            <Input
              id="uid"
              name="uid"
              defaultValue={defaults?.uid ?? ''}
              placeholder="ATU12345678"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? 'Wird gespeichert...' : 'Weiter zum Downloadcenter'}
        </Button>
      </div>
    </form>
  )
}
