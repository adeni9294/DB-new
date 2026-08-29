'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  PlusCircle, 
  Calendar, 
  CheckSquare, 
  ArrowUpRight,
  X 
} from 'lucide-react';

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<'pemasukan' | 'pengeluaran' | 'acara' | null>(null);

  const financialSummary = {
    totalBalance: 42850000,
    incomeThisMonth: 12500000,
    expenseThisMonth: 6820000,
    remainingBudget: 3180000,
    budgetUsedPercent: 68.2,
  };

  const budgetProgress = [
    { category: 'Makanan & Minuman', used: 70, status: 'safe' },
    { category: 'Transportasi', used: 45, status: 'safe' },
    { category: 'Kas Organisasi K&B', used: 82, status: 'warning' },
    { category: 'Acara Seminar Kit', used: 104, status: 'danger' },
  ];

  return (
    <div className="space-y-8 p-6 text-slate-100 font-sans relative">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Ringkasan Sistem K&B
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pantau arus kas, budget, organisasi, dan acara dalam satu tampilan.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 relative z-10">
          <button 
            onClick={() => setActiveModal('pemasukan')}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-2 rounded-xl text-sm font-medium transition-all backdrop-blur-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Pemasukan
          </button>

          <button 
            onClick={() => setActiveModal('pengeluaran')}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl text-sm font-medium transition-all backdrop-blur-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Pengeluaran
          </button>

          <button 
            onClick={() => setActiveModal('acara')}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-cyan-400" /> Acara Baru
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Total Saldo</span>
            <Wallet className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            Rp {financialSummary.totalBalance.toLocaleString('id-ID')}
          </p>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" /> +4.2% dari bulan lalu
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Pemasukan Bulan Ini</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            Rp {financialSummary.incomeThisMonth.toLocaleString('id-ID')}
          </p>
          <span className="text-xs text-slate-400 mt-2 block">Gaji + Sponsorship Acara</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Pengeluaran Bulan Ini</span>
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            Rp {financialSummary.expenseThisMonth.toLocaleString('id-ID')}
          </p>
          <span className="text-xs text-slate-400 mt-2 block">Personal & Operasional</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Sisa Budget Aktif</span>
            <PieChart className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            Rp {financialSummary.remainingBudget.toLocaleString('id-ID')}
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full" 
              style={{ width: `${financialSummary.budgetUsedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" /> Batas & Progress Budget
          </h2>
          <div className="space-y-4">
            {budgetProgress.map((b, idx) => {
              const statusColor = 
                b.status === 'danger' ? 'bg-rose-500' :
                b.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400';
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-medium">{b.category}</span>
                    <span className="text-slate-400">{b.used}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${statusColor} transition-all duration-500`}
                      style={{ width: `${Math.min(b.used, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" /> Agenda & Task Hari Ini
          </h2>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Rapat Panitia Seminar</p>
                <p className="text-xs text-slate-400">19:30 WIB • Ruang Utama Org</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-2" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Bayar Domain & Workspace</p>
                <p className="text-xs text-slate-400">Jatuh Tempo Hari Ini • Rp250.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Modal Form Dinamis */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white capitalize mb-4">
              Tambah {activeModal}
            </h3>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Data ${activeModal} berhasil disimpan!`);
                setActiveModal(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {activeModal === 'acara' ? 'Nama Acara' : 'Keterangan / Judul'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeModal === 'pemasukan' ? 'misal: Sponsorship / Gaji' :
                    activeModal === 'pengeluaran' ? 'misal: Beli Perlengkapan' : 'misal: Workshop UI/UX'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {activeModal !== 'acara' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Jumlah (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Kategori
                    </label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors">
                      <option value="kas">Kas Organisasi K&B</option>
                      <option value="operasional">Operasional</option>
                      <option value="acara">Kas Acara</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`w-1/2 py-2.5 font-semibold rounded-xl transition-all text-sm cursor-pointer ${
                    activeModal === 'pengeluaran'
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
