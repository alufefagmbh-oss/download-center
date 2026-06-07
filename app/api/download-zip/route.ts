import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import JSZip from 'jszip'

const FILE_TYPE_TO_EXT: Record<string, string> = {
  PDF: 'pdf', EXCEL: 'xlsx', XLSX: 'xlsx', XLS: 'xls',
  WORD: 'docx', DOCX: 'docx', DOC: 'doc', ZIP: 'zip',
  DXF: 'dxf', DWG: 'dwg', STEP: 'step', STP: 'stp',
  IGES: 'iges', IGS: 'igs', STL: 'stl', JPEG: 'jpg',
  JPG: 'jpg', PNG: 'png', WEBP: 'webp', MP4: 'mp4',
  TXT: 'txt', CSV: 'csv',
}

function resolveFilename(originalFilename: string, displayName: string, fileType: string): string {
  if (originalFilename) return originalFilename
  const ext = FILE_TYPE_TO_EXT[fileType?.toUpperCase()]
  if (ext) return `${displayName}.${ext}`
  if (fileType) return `${displayName}.${fileType.toLowerCase()}`
  return displayName
}

// Deduplicate filenames within the ZIP
function deduplicateFilename(name: string, seen: Map<string, number>): string {
  if (!seen.has(name)) {
    seen.set(name, 0)
    return name
  }
  const count = (seen.get(name) ?? 0) + 1
  seen.set(name, count)
  const dot = name.lastIndexOf('.')
  if (dot === -1) return `${name} (${count})`
  return `${name.slice(0, dot)} (${count})${name.slice(dot)}`
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
  if (ids.length === 0) return new NextResponse('Bad Request', { status: 400 })

  const [user, { data: downloads }] = await Promise.all([
    currentUser(),
    supabaseAdmin
      .from('downloads')
      .select('*, product_type:product_types(name, manufacturer:manufacturers(name))')
      .in('id', ids),
  ])

  if (!downloads?.length) return new NextResponse('Keine Dateien gefunden', { status: 404 })

  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  const meta = user?.privateMetadata as Record<string, string> | undefined
  const userName = meta?.name || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  const zip = new JSZip()
  const seen = new Map<string, number>()

  await Promise.all(
    downloads.map(async (download) => {
      const productType = download.product_type as { name: string; manufacturer: { name: string } } | null

      await supabaseAdmin.from('download_logs').insert({
        user_id: userId,
        user_email: email,
        user_name: userName,
        user_company: meta?.firma ?? '',
        user_phone: meta?.telefon ?? '',
        user_position: meta?.position ?? '',
        download_id: download.id,
        download_name: download.name,
        manufacturer_name: productType?.manufacturer?.name ?? '',
        product_name: productType?.name ?? '',
      })

      const fileRes = await fetch(download.file_url)
      if (!fileRes.ok) return

      const buffer = await fileRes.arrayBuffer()
      const rawName = resolveFilename(
        download.original_filename as string,
        download.name,
        download.file_type as string,
      )
      const filename = deduplicateFilename(rawName, seen)
      zip.file(filename, buffer)
    })
  )

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="downloads.zip"',
      'Cache-Control': 'no-store',
    },
  })
}
