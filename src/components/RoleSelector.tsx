'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from '@/app/actions/users'
import { Loader2 } from 'lucide-react'

const ROLES = [
  { value: 'pending', label: 'Pending' },
  { value: 'webmaster', label: 'Webmaster' },
  { value: 'admin', label: 'Admin' },
  { value: 'cs_chair', label: 'CS Chair' },
  { value: 'pes_chair', label: 'PES Chair' },
  { value: 'ras_chair', label: 'RAS Chair' },
  { value: 'wie_chair', label: 'WIE Chair' },
  { value: 'sight_chair', label: 'SIGHT Chair' },
  { value: 'sscs_chair', label: 'SSCS Chair' },
  { value: 'ias_chair', label: 'IAS Chair' },
  { value: 'sps_chair', label: 'SPS Chair' },
]

export function RoleSelector({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value
    setError(null)
    
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (!result.success) {
        setError(result.error || 'Failed to update role')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1 w-max">
      <div className="relative inline-flex items-center">
        <select
          value={currentRole}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-full px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-accent)] disabled:opacity-50 cursor-pointer"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin absolute right-2.5 text-slate-400" />
        ) : (
          <div className="pointer-events-none absolute right-2.5 flex items-center">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  )
}
