import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

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
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const meta = user?.privateMetadata as Record<string, string> | undefined
  const userCompany = meta?.firma ?? ''

  await supabaseAdmin.from('download_logs').insert({
    user_id: userId,
    user_email: email,
    user_name: userName,
    user_company: userCompany,
    download_id: id,
    download_name: download.name,
    manufacturer_name: productType?.manufacturer?.name ?? '',
    product_name: productType?.name ?? '',
  })

  const fileRes = await fetch(download.file_url)
  if (!fileRes.ok) {
    return new NextResponse('Datei nicht abrufbar', { status: 502 })
  }

  const filename = (download.original_filename as string) || download.name
  const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream'

  return new NextResponse(fileRes.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
    },
  })
}
