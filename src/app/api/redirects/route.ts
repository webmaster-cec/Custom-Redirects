import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { addRedirect, listRedirects } from '@/lib/cpanel'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await listRedirects()
    return NextResponse.json({ redirects: (data as any).data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { domain, slug, destination } = body

    if (!domain || !slug || !destination) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check slug availability
    const existing = await listRedirects()
    const isTaken = (existing as any).data?.some((r: any) => r.path === `/${slug}`)
    if (isTaken) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Call cPanel
    await addRedirect(domain, slug, destination)

    // Log action to MySQL redirect_logs
    try {
      await pool.execute(
        'INSERT INTO redirect_logs (action, domain, slug, destination, user_id, user_email) VALUES (?, ?, ?, ?, ?, ?)',
        ['CREATE', domain, slug, destination, session.user.id, session.user.email]
      )
    } catch (dbError) {
      console.error('Error logging to MySQL:', dbError)
    }

    return NextResponse.json({ success: true, message: 'Redirect created successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
