'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

type UserType = {
  id?: number
  email?: string
  fullName?: string
  role?: string
}

export default function DashboardShell({
  user,
  children
}: {
  user?: UserType
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.fullName && !user.fullName.includes('@') ? user.fullName : 'Ahmad Deni',
    email: user?.email || 'adeni9294@gmail.com'
  })

  // Sinkronisasi Tema saat Komponen Dimuat
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.name) {
            setProfile({
              name: data.name,
              email: data.email || profile.email
            })
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }
    getProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {}
    try {
      localStorage.clear()
    } catch (e) {}

    window.location.href = '/'
  }

  const menuItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Keuangan', href: '/dashboard/keuangan', icon: Wallet },
    { name: 'Acara & Kegiatan', href: '/dashboard/acara', icon: Calendar },
    { name: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
  ]

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'A'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans md:flex transition-colors duration-300">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Tombol Toggle Minimize */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white p-1 rounded-full shadow-md z-50 cursor-pointer transition-transform hover:scale-110"
          title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="space-y-6">
          {/* Logo, Brand & Switch Theme */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 shrink-0">
                {initial}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="text-base font-bold text-slate-900 dark:text-white block leading-tight truncate">
                    Sistem K&B
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">Management Platform</span>
                </div>
              )}
            </div>

            {/* Tombol Ganti Tema */}
            {!isCollapsed && <ThemeToggle />}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {isCollapsed && (
            <div className="flex justify-center pb-2">
              <ThemeToggle />
            </div>
          )}

          {/* Box Profil */}
          <div
            className={`flex items-center gap-3 px-2 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? `${profile.name}\n${profile.email}` : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-semibold text-sm shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {profile.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {profile.email}
                </p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Keluar (Logout)' : undefined}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Keluar (Logout)</span>}
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main
        className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
