'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  PlusCircle,
  Calendar,
  LogOut,
  Clock
} from 'lucide-react'

type DashboardData = {
  userEmail: string
  totalSaldo: number
  pemasukanBulanIni: number
  pengeluaranBulanIni: number
  sisaBudget: number
  pemasukanNote?: string
  pengeluaranNote?: string
  saldoPercentageChange?: string
  budgets: Array<{
    id: number
    category: string
    percentage: number
  }>
  agendaToday: Array<{
    id: number
    title: string
    time: string
  }>
}

interface DashboardClientProps {
  user?: {
    id?: any
    email?: any
    name?: any
  }
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    userEmail: user?.email || 'adeni9294@gmail.com',
    totalSaldo: 0,
    pemasukanBulanIni: 0,
    pengeluaranBulanIni: 0,
    sisaBudget: 0,
    budgets: [],
    agendaToday: []
  })

  // Fetch & Kalkulasi data langsung dari /api/transactions
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/transactions')
      if (res.ok) {
        const result = await res.json()
        const rawList = Array.isArray(result) ? result : result.data || []

        let totalPemasukan = 0
        let totalPengeluaran = 0

        rawList.forEach((item: any) => {
          const type = (item.TYPE || item.type || '').toLowerCase()
          const amount = Number(item.AMOUNT || item.amount || 0)

          if (type === 'pemasukan' || type === 'income') {
            totalPemasukan += amount
          } else if (type === 'pengeluaran' || type === 'expense') {
            totalPengeluaran += amount
          }
        })

        const totalSaldo = totalPemasukan - totalPengeluaran

        setData({
          userEmail: user?.email || 'adeni9294@gmail.com',
          totalSaldo,
          pemasukanBulanIni: totalPemasukan,
          pengeluaranBulanIni: totalPengeluaran,
          sisaBudget: 3180000,
          pemasukanNote: 'Total Kas Masuk (Oracle DB)',
          pengeluaranNote: 'Total Kas Keluar (Oracle DB)',
          saldoPercentageChange: '+0% dari bulan lalu',
          budgets: [
            { id: 1, category: 'Makanan & Minuman', percentage: 70 },
            { id: 2, category: 'Transportasi', percentage: 45 },
            { id: 3, category: 'Kas Organisasi K&B', percentage: 82 },
            { id: 4, category: 'Acara Seminar Kit', percentage: 104 }
          ],
          agendaToday: [
            { id: 1, title: 'Rapat Koordinasi', time: '10:00 - 11:30' },
            { id: 2, title: 'Penutupan Donasi', time: 'Sampai 17 Sep 2026' }
          ]
        })
      }
    } catch (err) {
      console.error('Gagal mengambil data dari Oracle DB:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            Halo, <span className="text-white">{data.userEmail}</span> 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantau arus kas, budget, organisasi, dan acara dalam satu tampilan.
          </p>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/keuangan?action=pemasukan"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/60 rounded-xl text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Pemasukan
          </Link>

          <Link
            href="/dashboard/keuangan?action=pengeluaran"
            className="flex items-center gap-2 px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 rounded-xl text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Pengeluaran
          </Link>

          <Link
            href="/dashboard/acara?action=baru"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all"
          >
            <Calendar className="w-4 h-4" /> Acara Baru
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL SALDO */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Saldo</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {loading ? '...' : `Rp ${data.totalSaldo.toLocaleString('id-ID')}`}
            </h2>
            <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              {data.saldoPercentageChange || '+0% dari bulan lalu'}
            </p>
          </div>
        </div>

        {/* CARD 2: PEMASUKAN BULAN INI */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pemasukan Bulan Ini</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {loading ? '...' : `Rp ${data.pemasukanBulanIni.toLocaleString('id-ID')}`}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 truncate">
              {data.pemasukanNote || 'Arus kas masuk'}
            </p>
          </div>
        </div>

        {/* CARD 3: PENGELUARAN BULAN INI */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pengeluaran Bulan Ini</span>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {loading ? '...' : `Rp ${data.pengeluaranBulanIni.toLocaleString('id-ID')}`}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 truncate">
              {data.pengeluaranNote || 'Operasional & Kegiatan'}
            </p>
          </div>
        </div>

        {/* CARD 4: SISA BUDGET AKTIF */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sisa Budget Aktif</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {loading ? '...' : `Rp ${data.sisaBudget.toLocaleString('id-ID')}`}
            </h2>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-cyan-400 h-full w-[65%]" />
            </div>
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

          {loading ? (
            <p className="text-xs text-slate-400">Memuat budget dari database...</p>
          ) : data.budgets.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">Belum ada data budget di Oracle DB.</p>
          ) : (
            <div className="space-y-4">
              {data.budgets.map((b) => (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{b.category}</span>
                    <span
                      className={`font-bold ${
                        b.percentage > 100 ? 'text-rose-400' : b.percentage > 80 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.percentage > 100
                          ? 'bg-rose-500'
                          : b.percentage > 80
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AGENDA & TASK HARI INI */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Agenda & Task Hari Ini</h2>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Memuat agenda...</p>
          ) : data.agendaToday.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">Tidak ada agenda untuk hari ini.</p>
          ) : (
            <div className="space-y-3">
              {data.agendaToday.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
