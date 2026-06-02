import { supabaseAdmin } from '@/lib/supabase'
import { Input } from '@/components/ui/input'

interface PageProps {
  searchParams: Promise<{
    date_from?: string
    date_to?: string
    file?: string
    manufacturer?: string
    company?: string
    email?: string
  }>
}

export default async function LogsAdminPage({ searchParams }: PageProps) {
  const params = await searchParams

  let query = supabaseAdmin
    .from('download_logs')
    .select('*')
    .order('downloaded_at', { ascending: false })
    .limit(500)

  if (params.date_from) query = query.gte('downloaded_at', params.date_from)
  if (params.date_to) query = query.lte('downloaded_at', params.date_to + 'T23:59:59')
  if (params.file) query = query.ilike('download_name', `%${params.file}%`)
  if (params.manufacturer) query = query.ilike('manufacturer_name', `%${params.manufacturer}%`)
  if (params.company) query = query.ilike('user_company', `%${params.company}%`)
  if (params.email) query = query.ilike('user_email', `%${params.email}%`)

  const { data: logs } = await query

  const hasFilter = !!(params.date_from || params.date_to || params.file || params.manufacturer || params.company || params.email)

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark-gray">Download-Protokoll</h1>
        <p className="text-brand-gray mt-1">Alle Downloads mit Benutzerinformationen</p>
      </div>

      {/* Filter */}
      <form method="GET" className="bg-white border border-brand-light-gray p-6 mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-gray mb-4 border-b border-brand-light-gray pb-3">
          Filter
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-brand-gray mb-1">Datum von</label>
            <Input
              type="date"
              name="date_from"
              defaultValue={params.date_from ?? ''}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-gray mb-1">Datum bis</label>
            <Input
              type="date"
              name="date_to"
              defaultValue={params.date_to ?? ''}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-gray mb-1">Datei</label>
            <Input
              type="text"
              name="file"
              defaultValue={params.file ?? ''}
              placeholder="Dateibezeichnung"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-gray mb-1">Hersteller</label>
            <Input
              type="text"
              name="manufacturer"
              defaultValue={params.manufacturer ?? ''}
              placeholder="Herstellername"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-gray mb-1">Firma</label>
            <Input
              type="text"
              name="company"
              defaultValue={params.company ?? ''}
              placeholder="Firmenname"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-gray mb-1">E-Mail</label>
            <Input
              type="text"
              name="email"
              defaultValue={params.email ?? ''}
              placeholder="benutzer@firma.de"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-brand-blue text-white px-5 py-2 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
          >
            Filtern
          </button>
          {hasFilter && (
            <a
              href="/admin/logs"
              className="text-sm text-brand-gray hover:text-brand-blue transition-colors"
            >
              Filter zurücksetzen
            </a>
          )}
        </div>
      </form>

      {/* Results */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-brand-gray">
          {logs?.length ?? 0} {hasFilter ? 'gefilterte ' : ''}Einträge
          {logs && logs.length >= 500 && ' (max. 500 angezeigt)'}
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="bg-white border border-brand-light-gray text-center py-16">
          <p className="text-brand-gray">Keine Downloads gefunden.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-light-gray overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-brand-dark-gray text-white text-left">
                <th className="px-4 py-3 font-bold">Datum</th>
                <th className="px-4 py-3 font-bold">E-Mail</th>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Firma</th>
                <th className="px-4 py-3 font-bold">Datei</th>
                <th className="px-4 py-3 font-bold">Hersteller</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-brand-light-gray hover:bg-gray-50">
                  <td className="px-4 py-3 text-brand-gray whitespace-nowrap">
                    {new Date(log.downloaded_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-brand-gray">{log.user_email}</td>
                  <td className="px-4 py-3 text-brand-gray">{(log as Record<string, string>).user_name || '–'}</td>
                  <td className="px-4 py-3 text-brand-gray">{(log as Record<string, string>).user_company || '–'}</td>
                  <td className="px-4 py-3 font-bold text-brand-dark-gray">{log.download_name}</td>
                  <td className="px-4 py-3 text-brand-gray">{log.manufacturer_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
