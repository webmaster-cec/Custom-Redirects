import { NextResponse } from 'next/server'
import { listRedirects } from '@/lib/cpanel'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const redirects = await listRedirects()
    
    // Check if the path exists on the SPECIFIC domain
    const isTaken = (redirects as any).data?.some((r: any) => 
      r.domain === domain && 
      (r.sourceurl === `/${slug}` || r.sourceurl === `^/${slug}/?$` || r.source === `/${slug}` || r.source === `^/${slug}/?$`)
    )
    
    return NextResponse.json({ available: !isTaken })
  } catch (error: any) {
    return NextResponse.json({ available: false, error: error.message })
  }
}
