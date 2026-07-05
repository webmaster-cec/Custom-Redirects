import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, LayoutDashboard, History, Users, Menu, X } from 'lucide-react'
import { AutoRefresh } from '@/components/AutoRefresh'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'pending'
  const isAdmin = userRole === 'webmaster' || userRole === 'admin'

  return (
    <div className="min-h-screen bg-[var(--color-blue-main)] flex flex-col">
      <nav className="bg-[var(--color-blue-primary)] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center cursor-pointer group">
                <Image src="/SB-logo30-.png" alt="Logo" width={200} height={70} className="object-contain group-hover:scale-105 transition-transform duration-300" />
              </Link>

              <div className="hidden sm:flex sm:space-x-2">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-300 active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                  <span className="relative transition-all duration-300 group-hover:translate-x-0.5 group-hover:tracking-wide">
                    Dashboard
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/dashboard/logs"
                    className="group inline-flex items-center px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-300 active:scale-95"
                  >
                    <History className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <span className="relative transition-all duration-300 group-hover:translate-x-0.5 group-hover:tracking-wide">
                      Audit Logs
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/dashboard/users"
                    className="group inline-flex items-center px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-300 active:scale-95"
                  >
                    <Users className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <span className="relative transition-all duration-300 group-hover:translate-x-0.5 group-hover:tracking-wide">
                      Users
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop User Info */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white/90">
                  {user.email}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold bg-white/10 px-2 py-0.5 rounded-full mt-0.5">
                  {userRole.replace('_', ' ')}
                </span>
              </div>

              {/* Mobile Role Badge */}
              <div className="sm:hidden flex items-center mr-2">
                <span className="text-[10px] uppercase tracking-wider text-white/90 font-semibold bg-[var(--color-cyan-accent)]/20 border border-[var(--color-cyan-accent)]/30 px-2.5 py-1 rounded-full">
                  {userRole.replace('_', ' ')}
                </span>
              </div>
              <form action="/auth/signout" method="post" className="hidden sm:block">
                <button
                  type="submit"
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                  title="Sign out"
                  suppressHydrationWarning
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>

              {/* Mobile Navigation Toggle */}
              <div className="sm:hidden flex items-center">
                <details className="group relative">
                  <summary className="list-none p-2 text-white cursor-pointer hover:bg-white/10 rounded-xl transition-colors">
                    <Menu className="w-6 h-6 block group-open:hidden" />
                    <X className="w-6 h-6 hidden group-open:block" />
                  </summary>

                  {/* Mobile Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-blue-primary)] border border-white/10 rounded-xl shadow-xl flex flex-col py-2 z-50">
                    <span className="px-4 py-3 text-xs font-medium text-white/60 border-b border-white/10 mb-1 truncate block">
                      {user.email} <span className="uppercase font-bold text-white/80 ml-1">({userRole.replace('_', ' ')})</span>
                    </span>
                    <Link href="/dashboard" className="px-4 py-3 text-sm text-white/90 hover:bg-white/20 transition-colors flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <>
                        <Link href="/dashboard/logs" className="px-4 py-3 text-sm text-white/90 hover:bg-white/20 transition-colors flex items-center">
                          <History className="w-4 h-4 mr-3 opacity-70" />
                          Audit Logs
                        </Link>
                        <Link href="/dashboard/users" className="px-4 py-3 text-sm text-white/90 hover:bg-white/20 transition-colors flex items-center">
                          <Users className="w-4 h-4 mr-3 opacity-70" />
                          Users
                        </Link>
                      </>
                    )}
                    <div className="h-[1px] bg-white/10 my-1 w-full"></div>
                    <form action="/auth/signout" method="post" className="w-full">
                      <button type="submit" className="w-full text-left px-4 py-3 text-sm text-red-200 hover:bg-white/10 hover:text-red-100 transition-colors flex items-center">
                        <LogOut className="w-4 h-4 mr-3 opacity-70" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AutoRefresh interval={10000} />
        {children}
      </main>
    </div>
  )
}
