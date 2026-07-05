import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { deleteRedirect } from '@/lib/cpanel'
import pool from '@/lib/db'

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const { slug } = await params

    if (!domain || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userEmail = session.user.email

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'pending'
    const isAdmin = userRole === 'webmaster' || userRole === 'admin'

    if (!isAdmin) {
      const [rows] = await pool.execute(
        'SELECT user_email FROM redirect_logs WHERE domain = ? AND slug = ? AND action = "CREATE" ORDER BY created_at DESC LIMIT 1',
        [domain, slug]
      )
      const creatorEmail = (rows as any[])[0]?.user_email

      if (creatorEmail !== userEmail) {
        return NextResponse.json({ error: 'Forbidden: You can only delete redirects you created' }, { status: 403 })
      }
    }

    await deleteRedirect(domain, slug)

    // Log action to MySQL redirect_logs
    try {
      await pool.execute(
        'INSERT INTO redirect_logs (action, domain, slug, user_id, user_email) VALUES (?, ?, ?, ?, ?)',
        ['DELETE', domain, slug, session.user.id, session.user.email]
      )
    } catch (dbError) {
      console.error('Error logging to MySQL:', dbError)
    }

    return NextResponse.json({ success: true, message: 'Redirect deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
