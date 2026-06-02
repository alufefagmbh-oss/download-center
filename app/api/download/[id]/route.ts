import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

const FILE_TYPE_TO_MIME: Record<string, { mime: string; ext: string }> = {
  PDF:   { mime: 'application/pdf',                                                                ext: 'pdf'  },
  EXCEL: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',             ext: 'xlsx' },
  XLSX:  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',             ext: 'xlsx' },
  XLS:   { mime: 'application/vnd.ms-excel',                                                      ext: 'xls'  },
  WORD:  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',       ext: 'docx' },
  DOCX:  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',       ext: 'docx' },
  DOC:   { mime: 'application/msword',                                                            ext: 'doc'  },
  ZIP:   { mime: 'application/zip',                                                               ext: 'zip'  },
  DXF:   { mime: 'application/dxf',                                                              ext: 'dxf'  },
  DWG:   { mime: 'application/acad',                                                             ext: 'dwg'  },
  STEP:  { mime: 'model/step',                                                                    ext: 'step' },
  STP:   { mime: 'model/step',                                                                    ext: 'stp'  },
  IGES:  { mime: 'model/iges',                                                                    ext: 'iges' },
  IGS:   { mime: 'model/iges',                                                                    ext: 'igs'  },
  STL:   { mime: 'model/stl',                                                                     ext: 'stl'  },
  JPEG:  { mime: 'image/jpeg',                                                                    ext: 'jpg'  },
  JPG:   { mime: 'image/jpeg',                                                                    ext: 'jpg'  },
  PNG:   { mime: 'image/png',                                                                     ext: 'png'  },
  WEBP:  { mime: 'image/webp',                                                                    ext: 'webp' },
  MP4:   { mime: 'video/mp4',                                                                     ext: 'mp4'  },
  TXT:   { mime: 'text/plain',                                                                    ext: 'txt'  },
  CSV:   { mime: 'text/csv',                                                                      ext: 'csv'  },
}

function resolveFilename(originalFilename: string, displayName: string, fileType: string): string {
  // Originaldateiname hat Priorität wenn vorhanden
  if (originalFilename) return originalFilename

  // Extension aus file_type ableiten
  const info = FILE_TYPE_TO_MIME[fileType?.toUpperCase()]
  if (info) return `${displayName}.${info.ext}`

  // fileType selbst als Extension nutzen (z.B. "DXF" → "name.dxf")
  if (fileType) return `${displayName}.${fileType.toLowerCase()}`

  return displayName
}

function resolveContentType(fileType: string, fallback: string | null): string {
  const info = FILE_TYPE_TO_MIME[fileType?.toUpperCase()]
  if (info) return info.mime
  if (fallback && fallback !== 'application/octet-stream') return fallback
  return 'application/octet-stream'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const { id } = await params

  const [user, { data: download, error }] = await Promise.all([
    currentUser(),
    supabaseAdmin
      .from('downloads')
      .select('*, product_type:product_types(name, manufacturer:manufacturers(name))')
      .eq('id', id)
      .single(),
  ])

  if (error || !download) {
    return new NextResponse('Datei nicht gefunden', { status: 404 })
  }

  const productType = download.product_type as { name: string; manufacturer: { name: string } } | null
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  const meta = user?.privateMetadata as Record<string, string> | undefined

  await supabaseAdmin.from('download_logs').insert({
    user_id: userId,
    user_email: email,
    user_name: meta?.name || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
    user_company: meta?.firma ?? '',
    user_phone: meta?.telefon ?? '',
    user_position: meta?.position ?? '',
    download_id: id,
    download_name: download.name,
    manufacturer_name: productType?.manufacturer?.name ?? '',
    product_name: productType?.name ?? '',
  })

  const fileRes = await fetch(download.file_url)
  if (!fileRes.ok) {
    return new NextResponse('Datei nicht abrufbar', { status: 502 })
  }

  const filename = resolveFilename(
    download.original_filename as string,
    download.name,
    download.file_type as string
  )
  const contentType = resolveContentType(
    download.file_type as string,
    fileRes.headers.get('content-type')
  )

  return new NextResponse(fileRes.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
    },
  })
}
