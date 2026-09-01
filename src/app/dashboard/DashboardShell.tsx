'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  LogOut,
  User,
  Settings
} from 'lucide-react'

type User = {
  id: number
  email: string
  fullName: string
  role?: string
}

export default function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore
    }
    try { localStorage.removeItem('user') } catch (e) { }
    // use router.push to stay client-side
    router.push('/login')
  }

  const menuItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Keuangan', href: '/dashboard/keuangan', icon: Wallet },
    { name: 'Acara & Kegiatan', href: '/dashboard/acara', icon: Calendar },
    { name: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans md:flex">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-6 flex-col justify-between backdrop-blur-xl shrink-0 md:fixed md:left-0 md:top-0 md:h-screen z-20">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              {user.fullName?.charAt(0).toUpperCase() || 'K'}
            </div>
            <div>
              <span className="text-base font-bold text-white block">Sistem K&B</span>
              <span className="text-xs text-slate-400">Management Platform</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon as any
              // aktif kalau path sama atau subpath dari href
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-cyan-400 font-semibold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto md:ml-64 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
