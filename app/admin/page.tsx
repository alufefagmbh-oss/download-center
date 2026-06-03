import Link from 'next/link'
import { Building2, Package, Download, FileText } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'

function parseBytes(size: string): number {
  const m = size.trim().match(/^([\d.,]+)\s*(B|KB|MB|GB|TB)?$/i)
  if (!m) return 0
  const n = parseFloat(m[1].replace(',', '.'))
  const u = (m[2] ?? 'B').toUpperCase()
  const mul: Record<string, number> = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 }
  return n * (mul[u] ?? 1)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

export default async function AdminDashboard() {
  const [
    { count: manufacturerCount },
    { count: productCount },
    { data: downloadRows, count: downloadCount },
    { count: logCount },
  ] = await Promise.all([
    supabaseAdmin.from('manufacturers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('product_types').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('downloads').select('file_size', { count: 'exact' }),
    supabaseAdmin.from('download_logs').select('*', { count: 'exact', head: true }),
  ])

  const totalBytes = (downloadRows ?? []).reduce((sum, d) => sum + parseBytes(d.file_size ?? ''), 0)
  const totalSize = formatBytes(totalBytes)

  const { data: recentLogs } = await supabaseAdmin
    .from('download_logs')
    .select('*')
    .order('downloaded_at', { ascending: false })
    .limit(10)

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark-gray">Dashboard</h1>
        <p className="text-brand-gray mt-1">Übersicht des ALUFEFA Downloadcenters</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Link href="/admin/manufacturers" className="bg-white border border-brand-light-gray p-6 hover:border-brand-blue transition-colors group">
          <Building2 className="text-brand-blue group-hover:text-brand-dark-blue mb-3" size={22} />
          <p className="text-3xl font-bold text-brand-dark-gray">{manufacturerCount ?? 0}</p>
          <p className="text-sm text-brand-gray mt-1">Hersteller</p>
        </Link>

        <Link href="/admin/products" className="bg-white border border-brand-light-gray p-6 hover:border-brand-blue transition-colors group">
          <Package className="text-brand-blue group-hover:text-brand-dark-blue mb-3" size={22} />
          <p className="text-3xl font-bold text-brand-dark-gray">{productCount ?? 0}</p>
          <p className="text-sm text-brand-gray mt-1">Produktarten</p>
        </Link>

        <div className="bg-white border border-brand-light-gray p-6">
          <Download className="text-brand-blue mb-3" size={22} />
          <p className="text-3xl font-bold text-brand-dark-gray">{downloadCount ?? 0}</p>
          <p className="text-sm text-brand-gray mt-1">Downloads</p>
          <p className="text-xs text-brand-gray mt-0.5">{totalSize} gesamt</p>
        </div>

        <Link href="/admin/logs" className="bg-white border border-brand-light-gray p-6 hover:border-brand-blue transition-colors group">
          <FileText className="text-brand-blue group-hover:text-brand-dark-blue mb-3" size={22} />
          <p className="text-3xl font-bold text-brand-dark-gray">{logCount ?? 0}</p>
          <p className="text-sm text-brand-gray mt-1">Download-Logs</p>
        </Link>
      </div>

      {/* Recent downloads */}
      {recentLogs && recentLogs.length > 0 && (
        <div>
          <h2 className="text-sm font-bold tracking-widest uppercase text-brand-gray mb-4 border-b border-brand-light-gray pb-2">
            Letzte Downloads
          </h2>
          <div className="bg-white border border-brand-light-gray overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-dark-gray text-white text-left">
                  <th className="px-4 py-3 font-bold">Benutzer</th>
                  <th className="px-4 py-3 font-bold">Datei</th>
                  <th className="px-4 py-3 font-bold">Hersteller</th>
                  <th className="px-4 py-3 font-bold">Datum</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-t border-brand-light-gray hover:bg-gray-50">
                    <td className="px-4 py-3 text-brand-gray">{log.user_email || log.user_id.slice(0, 8) + '...'}</td>
                    <td className="px-4 py-3 font-bold text-brand-dark-gray">{log.download_name}</td>
                    <td className="px-4 py-3 text-brand-gray">{log.manufacturer_name}</td>
                    <td className="px-4 py-3 text-brand-gray">
                      {new Date(log.downloaded_at).toLocaleDateString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
