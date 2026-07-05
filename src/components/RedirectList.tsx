'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RedirectRow } from './RedirectRow'
import { Search, ChevronDown, Check, RefreshCw } from 'lucide-react'

interface Redirect {
  domain: string
  path: string
  dest: string
  user_email?: string
}

export function RedirectList({ redirects, domains, currentUserEmail, isAdmin = false }: { redirects: Redirect[], domains: string[], currentUserEmail?: string, isAdmin?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const filteredRedirects = redirects.filter(redirect => {
    const matchesSearch = redirect.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          redirect.dest.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDomain = selectedDomain === 'all' || redirect.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  if (!redirects || redirects.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-blue-surface)] p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No redirects yet</h3>
        <p className="text-slate-500">Create your first redirect to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-blue-surface)] overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-[var(--color-blue-surface)] bg-[var(--color-blue-main)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800">Active Redirects</h2>
          <span className="text-sm text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
            {filteredRedirects.length}
          </span>
          <button 
            onClick={handleRefresh}
            disabled={isPending}
            className="ml-2 p-1.5 text-slate-400 hover:text-[var(--color-blue-primary)] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin text-[var(--color-blue-primary)]' : ''}`} />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-[200px] flex justify-between items-center px-3 py-2 border border-[var(--color-blue-surface)] rounded-xl leading-5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-cyan-accent)] focus:border-[var(--color-cyan-accent)] transition-colors text-slate-900"
            >
              <span className="truncate">{selectedDomain === 'all' ? 'All Domains' : (selectedDomain === 'cecieee.org' ? 'cecieee.org (Main)' : selectedDomain)}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <ul className="absolute right-0 sm:right-auto z-50 w-full sm:w-[200px] mt-2 bg-white border border-[var(--color-blue-surface)] rounded-xl shadow-lg max-h-60 overflow-auto py-1 ring-1 ring-black/5 text-sm">
                  <li
                    onClick={() => {
                      setSelectedDomain('all')
                      setIsDropdownOpen(false)
                    }}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-[var(--color-blue-main)] transition-colors ${
                      selectedDomain === 'all' ? 'text-[var(--color-blue-primary)] bg-[var(--color-blue-main)] font-medium' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">All Domains</span>
                    {selectedDomain === 'all' && <Check className="w-4 h-4" />}
                  </li>
                  {domains.map(d => (
                    <li
                      key={d}
                      onClick={() => {
                        setSelectedDomain(d)
                        setIsDropdownOpen(false)
                      }}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-[var(--color-blue-main)] transition-colors ${
                        selectedDomain === d ? 'text-[var(--color-blue-primary)] bg-[var(--color-blue-main)] font-medium' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{d === 'cecieee.org' ? `${d} (Main)` : d}</span>
                      {selectedDomain === d && <Check className="w-4 h-4" />}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Search redirects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-blue-surface)] rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-cyan-accent)] focus:border-[var(--color-cyan-accent)] sm:text-sm transition-colors"
            />
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100 flex-1">
        {isPending ? (
          Array.from({ length: Math.max(3, Math.min(5, filteredRedirects.length || 5)) }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-[var(--color-blue-surface)] animate-pulse">
              <div className="flex-1 min-w-0 pr-4">
                <div className="h-5 bg-slate-200 rounded-md w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
                <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : filteredRedirects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No redirects match your search.
          </div>
        ) : (
          filteredRedirects.map((redirect, idx) => (
            <RedirectRow key={`${redirect.domain}-${redirect.path}-${idx}`} redirect={redirect} currentUserEmail={currentUserEmail} isAdmin={isAdmin} />
          ))
        )}
      </div>
    </div>
  )
}
