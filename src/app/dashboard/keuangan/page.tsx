'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, Filter, Search } from 'lucide-react'

type Transaction = {
  id: number
  title: string
  amount: number
  type: 'pemasukan' | 'pengeluaran'
  category: string
  date: string
}

export default function KeuanganPage() {
  const searchParams = useSearchParams()
  const defaultAction = searchParams.get('action') // Mengambil parameter ?action=pemasukan dari dashboard

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, title: 'Gaji Bulanan', amount: 8500000, type: 'pemasukan', category: 'Gaji', date: '2026-09-01' },
    { id: 2, title: 'Sponsorship Acara', amount: 4000000, type: 'pemasukan', category: 'Sponsor', date: '2026-09-02' },
    { id: 3, title: 'Belanja Konsumsi Rapat', amount: 350000, type: 'pengeluaran', category: 'Makanan & Minuman', date: '2026-09-02' },
    { id: 4, title: 'Bensin & Operasional', amount: 120000, type: 'pengeluaran', category: 'Transportasi', date: '2026-09-02' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formType, setFormType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')

  // Buka modal secara otomatis jika diakses dari tombol quick action Dashboard
  useEffect(() => {
    if (defaultAction === 'pemasukan') {
      setFormType('pemasukan')
      setIsModalOpen(true)
    } else if (defaultAction === 'pengeluaran') {
      setFormType('pengeluaran')
      setIsModalOpen(true)
    }
  }, [defaultAction])

  // Tambah Transaksi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    const newTx: Transaction = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      type: formType,
      category: category || 'Umum',
      date: new Date().toISOString().split('T')[0]
    }

    setTransactions([newTx, ...transactions])
    setIsModalOpen(false)
    setTitle('')
    setAmount('')
    setCategory('')
  }

  // Hitung Ringkasan Singkat
  const totalPemasukan = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalPengeluaran = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Keuangan</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola dan catat semua transaksi arus kas organisasi.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setFormType('pemasukan'); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" /> + Pemasukan
          </button>
          <button
            onClick={() => { setFormType('pengeluaran'); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" /> + Pengeluaran
          </button>
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Pemasukan</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">Rp {totalPemasukan.toLocaleString('id-ID')}</h3>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Pengeluaran</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">Rp {totalPengeluaran.toLocaleString('id-ID')}</h3>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Saldo Bersih</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">
            Rp {(totalPemasukan - totalPengeluaran).toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-white">Riwayat Transaksi</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Judul / Keterangan</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Jenis</th>
                <th className="p-3 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="p-3 text-slate-400">{t.date}</td>
                  <td className="p-3 font-semibold text-white">{t.title}</td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                      t.type === 'pemasukan' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold ${t.type === 'pemasukan' ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {t.type === 'pemasukan' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT TRANSAKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              Tambah {formType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Judul Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Honorarium / Pembelian Alat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Operasional, Gaji, Event"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
