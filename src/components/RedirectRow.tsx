'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Trash2, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Redirect {
  domain: string
  path: string
  dest: string
  user_email?: string
}

export function RedirectRow({ redirect, currentUserEmail, isAdmin = false }: { redirect: Redirect, currentUserEmail?: string, isAdmin?: boolean }) {
  const isCreator = currentUserEmail && redirect.user_email ? currentUserEmail === redirect.user_email : false
  const canDelete = isAdmin || isCreator
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  
  const fullUrl = `https://${redirect.domain}${redirect.path}`
  // Clean up the path from regex to a normal slug
  const displaySlug = redirect.path.replace(/^\^?\/|\/\?\$|\/$/g, '')
  const cleanUrl = `https://${redirect.domain}/${displaySlug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/redirects/${displaySlug}?domain=${redirect.domain}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (error) {
      console.error(error)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-blue-surface)] hover:bg-[var(--color-blue-main)] transition-colors group">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-slate-900 truncate">{redirect.domain}/{displaySlug}</span>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[var(--color-blue-primary)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="text-sm text-slate-500 truncate flex items-center">
            <span className="mr-2 text-slate-400">→</span>
            <a href={redirect.dest} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
              {redirect.dest}
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[var(--color-blue-surface)] rounded-lg transition-all"
            title="Copy URL"
            suppressHydrationWarning
          >
            {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>

          {canDelete ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
              title="Delete Redirect"
              suppressHydrationWarning
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9" title="You don't have permission to delete this redirect" />
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete redirect</h3>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs mx-1 break-all shadow-sm">{redirect.domain}/{displaySlug}</span>? This link will immediately stop working.
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end w-full gap-2 sm:gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                suppressHydrationWarning
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
                suppressHydrationWarning
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
