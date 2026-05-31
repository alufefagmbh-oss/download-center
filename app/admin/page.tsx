import Link from 'next/link'
import { Building2, Package, Download, FileText } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'

export default async function AdminDashboard() {
  const [
    { count: manufacturerCount },
    { count: productCount },
    { count: downloadCount },
    { count: logCount },
  ] = await Promise.all([
    supabaseAdmin.from('manufacturers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('product_types').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('downloads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('download_logs').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Hersteller', value: manufacturerCount ?? 0, icon: Building2, href: '/admin/manufacturers' },
    { label: 'Produktarten', value: productCount ?? 0, icon: Package, href: '/admin/manufacturers' },
    { label: 'Downloads', value: downloadCount ?? 0, icon: Download, href: '/admin/manufacturers' },
    { label: 'Download-Logs', value: logCount ?? 0, icon: FileText, href: '#' },
  ]

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
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-brand-light-gray p-6 hover:border-brand-blue transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="text-brand-blue group-hover:text-brand-dark-blue" size={22} />
            </div>
            <p className="text-3xl font-bold text-brand-dark-gray">{value}</p>
            <p className="text-sm text-brand-gray mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-sm font-bold tracking-widest uppercase text-brand-gray mb-4 border-b border-brand-light-gray pb-2">
          Schnellzugriff
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/manufacturers/new"
            className="bg-brand-blue text-white px-5 py-2.5 font-bold hover:bg-brand-dark-blue transition-colors text-sm"
          >
            + Hersteller anlegen
          </Link>
          <Link
            href="/admin/manufacturers"
            className="bg-white border border-brand-blue text-brand-blue px-5 py-2.5 font-bold hover:bg-brand-blue hover:text-white transition-colors text-sm"
          >
            Hersteller verwalten
          </Link>
        </div>
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
