import pool from '@/lib/db'
import { createClient } from '@/lib/supabase-server'

export default async function AuditLogPage() {
  let logs: any[] = []
  let error = null

  try {
    const [rows] = await pool.execute('SELECT * FROM redirect_logs ORDER BY created_at DESC LIMIT 100')
    const dbLogs = rows as any[]
    
    const supabase = await createClient()
    const { data: profiles } = await supabase.from('profiles').select('id, role')
    const profileMap = new Map((profiles || []).map(p => [p.id, p.role]))

    logs = dbLogs.map(log => ({
      ...log,
      user_role: profileMap.get(log.user_id) || 'unknown'
    }))
  } catch (err: any) {
    error = err.message
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl">
        Error loading logs from MySQL: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-1">Recent redirect changes and activity.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Path</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    /{log.slug}
                  </td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">
                    {log.destination || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 capitalize">
                    {log.user_role}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }).format(new Date(log.created_at))}
                  </td>
                </tr>
              ))}
              
              {!logs?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
