import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return false
  const user = await currentUser()
  return (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return new NextResponse('Nicht autorisiert', { status: 403 })
  }

  const p = req.nextUrl.searchParams

  let query = supabaseAdmin
    .from('download_logs')
    .select('*')
    .order('downloaded_at', { ascending: false })
    .limit(10000)

  if (p.get('date_from')) query = query.gte('downloaded_at', p.get('date_from')!)
  if (p.get('date_to'))   query = query.lte('downloaded_at', p.get('date_to')! + 'T23:59:59')
  if (p.get('file'))         query = query.ilike('download_name',    `%${p.get('file')}%`)
  if (p.get('manufacturer')) query = query.ilike('manufacturer_name', `%${p.get('manufacturer')}%`)
  if (p.get('company'))      query = query.ilike('user_company',      `%${p.get('company')}%`)
  if (p.get('email'))        query = query.ilike('user_email',        `%${p.get('email')}%`)

  const { data: logs, error } = await query
  if (error) return new NextResponse('Datenbankfehler', { status: 500 })

  const rows = (logs ?? []).map((l) => {
    const r = l as Record<string, string>
    return {
      'Datum':       new Date(l.downloaded_at).toLocaleString('de-DE'),
      'Name':        r.user_name     || '',
      'E-Mail':      l.user_email    || '',
      'Firma':       r.user_company  || '',
      'Position':    r.user_position || '',
      'Telefon':     r.user_phone    || '',
      'Datei':       l.download_name || '',
      'Hersteller':  l.manufacturer_name || '',
      'Produkt':     l.product_name  || '',
    }
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Spaltenbreiten
  ws['!cols'] = [
    { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 22 },
    { wch: 18 }, { wch: 16 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Download-Logs')

  const buf: Uint8Array = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(buf.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="download-logs-${date}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
