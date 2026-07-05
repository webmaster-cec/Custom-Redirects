import { createClient } from '@/lib/supabase-server'
import { listRedirects } from '@/lib/cpanel'
import { CreateForm } from '@/components/CreateForm'
import { RedirectList } from '@/components/RedirectList'

import pool from '@/lib/db'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user role for admin privileges
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
    
  const userRole = profile?.role || 'pending'
  const isAdmin = userRole === 'webmaster' || userRole === 'admin'
  
  // Default domain for the app
  const DOMAIN = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || 'cecieee.org'
  
  let redirects = []
  let error = null
  let dbLogs: any[] = []

  try {
    const [rows] = await pool.execute("SELECT domain, slug, created_at, user_email FROM redirect_logs WHERE action = 'CREATE' ORDER BY created_at DESC LIMIT 1000")
    dbLogs = rows as any[]
  } catch (e) {
    console.error("Failed to fetch logs for sorting", e)
  }

  const timestampMap = new Map()
  const creatorMap = new Map()
  dbLogs.forEach(log => {
    timestampMap.set(`${log.domain}-/${log.slug}`, new Date(log.created_at).getTime())
    if (log.user_email) {
      creatorMap.set(`${log.domain}-/${log.slug}`, log.user_email)
    }
  })

  try {
    const response = await listRedirects()
    const uniqueRedirects = new Map()
    if (response.data) {
      for (let i = 0; i < response.data.length; i++) {
        const r = response.data[i]
        const path = r.sourceurl || r.source
        const key = `${r.domain}-${path}`
        if (!uniqueRedirects.has(key)) {
          uniqueRedirects.set(key, {
            domain: r.domain,
            path: path,
            dest: r.targeturl || r.destination,
            createdAt: timestampMap.get(key) || 0, // 0 means unknown/old
            user_email: creatorMap.get(key) || null
          })
        }
      }
    }
    
    redirects = Array.from(uniqueRedirects.values())
    
    // Sort by true creation date descending (newest first). Unlogged ones fall to the bottom.
    redirects.sort((a: any, b: any) => b.createdAt - a.createdAt)
    
    const uniqueDomains = Array.from(new Set(redirects.map((r: any) => r.domain))).sort()
    
  } catch (err: any) {
    error = err.message
  }

  // Fallback domain list if empty
  const allDomains = redirects.length > 0 
    ? [
        DOMAIN,
        ...Array.from(new Set(
          redirects
            .map((r: any) => r.domain.replace(/^\*\./, ''))
            .filter((d: string) => /[a-zA-Z]/.test(d) && d !== DOMAIN)
        )).sort()
      ]
    : [DOMAIN]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Redirect Manager</h1>
          <p className="text-slate-500 mt-1">Manage redirects for your domains</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
          Error loading redirects from cPanel: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {userRole === 'pending' ? (
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-blue-surface)] p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Pending Approval</h2>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 text-sm">
                    Your account is currently pending approval. Webmaster must assign you a role before you can create redirects.
                  </p>
                </div>
              </div>
            ) : (
              <CreateForm domains={allDomains} defaultDomain={DOMAIN} />
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <RedirectList redirects={redirects} domains={allDomains} currentUserEmail={user?.email} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  )
}
