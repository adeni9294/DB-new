'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, Edit2, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react'

type Transaction = {
  id: string | number
  title?: string
  notes?: string
  amount: number
  type: string
  category?: string
  date: string
}

function KeuanganContent() {
  const searchParams = useSearchParams()
  const defaultAction = searchParams.get('action')

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State Modal Form Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Transaction | null>(null)

  // State Custom Confirm Delete Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null)

  // State Toast Notification Modern
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [formType, setFormType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [])

  const getTodayString = () => {
    const today = new Date()
    return today.toLocaleDateString('en-CA')
  }

  // 1. Fetch Data dari Oracle DB
  const fetchTransactions = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/transactions', { signal })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      const transactionList = Array.isArray(data) ? data : (data.rows || [])
      setTransactions(transactionList)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Gagal mengambil data transaksi:', err)
      setError('Gagal memuat data transaksi dari Oracle DB')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchTransactions(controller.signal)
    return () => controller.abort()
  }, [fetchTransactions])

  const isIncome = (typeStr: string) => {
    if (!typeStr) return false
    const val = typeStr.toString().trim().toUpperCase()
    return val === 'INCOME' || val === 'PEMASUKAN' || val === 'IN'
  }

  const openAddModal = useCallback((type: 'pemasukan' | 'pengeluaran') => {
    setEditingItem(null)
    setFormType(type)
    setTitle('')
    setAmount('')
    setCategory('')
    setDate(getTodayString())
    setError(null)
    setIsModalOpen(true)
  }, [])

  useEffect(() => {
    if (defaultAction === 'pemasukan') openAddModal('pemasukan')
    else if (defaultAction === 'pengeluaran') openAddModal('pengeluaran')
  }, [defaultAction, openAddModal])

  const openEditModal = (item: Transaction) => {
    setEditingItem(item)
    setFormType(isIncome(item.type) ? 'pemasukan' : 'pengeluaran')
    setTitle(item.title || item.notes || '')
    setAmount(String(item.amount || 0))
    setCategory(item.category || 'Umum')
    setDate(item.date || getTodayString())
    setError(null)
    setIsModalOpen(true)
  }

  // 2. Submit Data (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !amount) {
      setError('Judul dan jumlah transaksi wajib diisi.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = {
      id: editingItem ? Number(editingItem.id) : undefined,
      title,
      notes: title,
      amount: parseFloat(amount),
      type: formType,
      category: category || 'Umum',
      date: date || getTodayString(),
    }

    try {
      const isEdit = !!editingItem
      const res = await fetch('/api/transactions', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const resData = await res.json()

      if (!res.ok) {
        throw new Error(resData.error || resData.details || `API Error: ${res.status}`)
      }

      setIsModalOpen(false)
      showToast(isEdit ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan', 'success')
      await fetchTransactions()
    } catch (err: any) {
      console.error('❌ Gagal menyimpan transaksi:', err)
      setError(err.message || 'Gagal menyimpan transaksi')
      showToast(err.message || 'Gagal menyimpan transaksi', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Delete Transaksi
  const confirmDelete = async () => {
    if (!deleteTargetId) return

    const numericId = Number(deleteTargetId)
    if (isNaN(numericId)) {
      showToast('ID transaksi tidak valid (Bukan angka)', 'error')
      setDeleteTargetId(null)
      return
    }

    try {
      const res = await fetch(`/api/transactions?id=${numericId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Gagal menghapus transaksi')
      }

      showToast('Transaksi berhasil dihapus', 'success')
      setDeleteTargetId(null)
      await fetchTransactions()
    } catch (err: any) {
      console.error('❌ Error DELETE transaction:', err)
      showToast(err.message || 'Gagal menghapus transaksi', 'error')
      setDeleteTargetId(null)
    }
  }

  const totalPemasukan = transactions
    .filter(t => isIncome(t.type))
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  const totalPengeluaran = transactions
    .filter(t => !isIncome(t.type))
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100 relative">
      
      {/* --- TOAST NOTIFICATION MODERN --- */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Keuangan</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola dan catat semua transaksi arus kas organisasi.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openAddModal('pemasukan')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> + Pemasukan
          </button>
          <button
            onClick={() => openAddModal('pengeluaran')}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> + Pengeluaran
          </button>
        </div>
      </div>

      {/* --- CARD RINGKASAN --- */}
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

      {/* --- TABEL RIWAYAT TRANSAKSI --- */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-white">Riwayat Transaksi</h2>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-slate-400">Memuat data dari database Oracle...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Judul / Keterangan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3 text-right">Jumlah</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">
                      Belum ada data transaksi di Oracle DB.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const income = isIncome(t.type)
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-all">
                        <td className="p-3 text-slate-400">{t.date || '-'}</td>
                        <td className="p-3 font-semibold text-white">{t.title || t.notes || 'Transaksi'}</td>
                        <td className="p-3">{t.category || 'Umum'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                            income 
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {income ? 'pemasukan' : 'pengeluaran'}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-bold ${income ? 'text-cyan-400' : 'text-rose-400'}`}>
                          {income ? '+' : '-'} Rp {Number(t.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(t)}
                              title="Edit Transaksi"
                              className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 hover:border-amber-500/30 rounded-lg transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(t.id)}
                              title="Hapus Transaksi"
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL FORM TAMBAH / EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Transaksi' : `Tambah ${formType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} Baru`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Jenis Transaksi</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'pemasukan' | 'pengeluaran')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Judul Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Honorarium / Pembelian Alat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
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
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Operasional, Gaji, Event"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? '⏳ Menyimpan...' : editingItem ? 'Update Transaksi' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODERN CONFIRMATION MODAL DELETE --- */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus transaksi ini? Data di database Oracle akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function KeuanganPage() {
  return (
    <Suspense fallback={<p className="text-xs text-slate-400 p-6">Memuat...</p>}>
      <KeuanganContent />
    </Suspense>
  )
}
