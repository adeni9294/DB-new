'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  CalendarPlus,
  LogOut,
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  CheckCircle2,
  Clock
} from 'lucide-react'

type UserType = {
  id?: number
  email?: string
  fullName?: string
  role?: string
}

export default function DashboardClient({ user }: { user?: UserType }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore error
    }
    try {
      localStorage.removeItem('user')
    } catch (e) {}
    router.push('/login')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER BAR & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            Halo, {user?.email || 'adeni9294@gmail.com'} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantau arus kas, budget, organisasi, dan acara dalam satu tampilan.
          </p>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => router.push('/dashboard/keuangan?action=pemasukan')}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Pemasukan
          </button>

          <button
            onClick={() => router.push('/dashboard/keuangan?action=pengeluaran')}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Pengeluaran
          </button>

          <button
            onClick={() => router.push('/dashboard/acara?action=baru')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <CalendarPlus className="w-4 h-4" /> Acara Baru
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Saldo</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mt-3">Rp 42.850.000</h3>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-4">
            <TrendingUp className="w-3 h-3" /> +4.2% dari bulan lalu
          </p>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pemasukan Bulan Ini</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mt-3">Rp 12.500.000</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Gaji + Sponsorship Acara</p>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pengeluaran Bulan Ini</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mt-3">Rp 6.820.000</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Personal & Operasional</p>
        </div>

        {/* Sisa Budget Aktif */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Sisa Budget Aktif</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mt-3">Rp 3.180.000</h3>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: BUDGET PROGRESS & AGENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BATAS & PROGRESS BUDGET */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Batas & Progress Budget</h2>
          </div>

          <div className="space-y-4">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Makanan & Minuman</span>
                <span>70%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            {/* Item 2 */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Transportasi</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* Item 3 */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Kas Organisasi K&B</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Item 4 */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Acara Seminar Kit</span>
                <span className="text-rose-400 font-semibold">104%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* AGENDA & TASK HARI INI */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Agenda & Task Hari Ini</h2>
          </div>

          <div className="space-y-3">
            {/* Task 1 */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                <h4 className="text-xs font-semibold text-slate-200">Rapat Koordinasi</h4>
              </div>
              <p className="text-[11px] text-slate-400 pl-4 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 10:00 - 11:30
              </p>
            </div>

            {/* Task 2 */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <h4 className="text-xs font-semibold text-slate-200">Penutupan Donasi</h4>
              </div>
              <p className="text-[11px] text-slate-400 pl-4">Sampai 17 Sep 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
