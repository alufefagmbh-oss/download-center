import { supabaseAdmin } from '@/lib/supabase'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('key, value')

  const settingsMap: Record<string, string> = {}
  for (const row of data ?? []) {
    settingsMap[row.key] = row.value
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark-gray">Einstellungen</h1>
        <p className="text-brand-gray mt-1">Systemkonfiguration anpassen</p>
      </div>

      <div className="max-w-xl">
        <section className="bg-white border border-brand-light-gray p-8">
          <h2 className="text-lg font-bold text-brand-dark-gray mb-1">E-Mail-Benachrichtigungen</h2>
          <p className="text-sm text-brand-gray mb-6">
            Bei jedem neuen Onboarding wird eine Benachrichtigung an diese Adresse gesendet.
          </p>
          <SettingsForm defaultValues={settingsMap} />
        </section>

        <section className="mt-6 bg-white border border-brand-light-gray p-8">
          <h2 className="text-lg font-bold text-brand-dark-gray mb-1">SMTP-Konfiguration</h2>
          <p className="text-sm text-brand-gray mb-4">
            Die SMTP-Zugangsdaten werden über Umgebungsvariablen konfiguriert (<code className="bg-gray-100 px-1">.env.local</code>):
          </p>
          <div className="bg-gray-50 border border-brand-light-gray p-4 text-xs font-mono space-y-1 text-brand-dark-gray">
            <p>SMTP_HOST=mail.example.com</p>
            <p>SMTP_PORT=587</p>
            <p>SMTP_USER=user@example.com</p>
            <p>SMTP_PASS=password</p>
            <p>SMTP_FROM=noreply@example.com</p>
            <p>SMTP_SECURE=false</p>
          </div>
        </section>
      </div>
    </main>
  )
}
