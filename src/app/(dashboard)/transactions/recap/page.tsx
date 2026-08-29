'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function TransactionRecapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Dummy Data untuk Simulasi Tampilan
  const dummyTransactions = [
    {
      id: 'TRX-101',
      date: '2026-08-28 14:30',
      type: 'EXPENSE',
      amount: 450000,
      category: 'Konsumsi',
      account: 'Bank BCA',
      context: 'Seminar Nasional 2026 (Panitia)',
      notes: 'DP Katering Konsumsi Peserta',
    },
    {
      id: 'TRX-102',
      date: '2026-08-27 09:15',
      type: 'INCOME',
      amount: 12500000,
      category: 'Gaji',
      account: 'Bank BCA',
      context: 'Personal',
      notes: 'Transfer Gaji Bulanan',
    },
    {
      id: 'TRX-103',
      date: '2026-08-25 18:00',
      type: 'TRANSFER',
      amount: 500000,
      category: 'Pindah Saldo',
      account: 'Bank BCA → GoPay',
      context: 'Personal',
      notes: 'Top Up Wallet Operasional',
    },
  ];

  return (
    <div className="space-y-6 p-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
            Rekap Transaksi
          </h1>
          <p className="text-slate-400 text-sm">
            Pantau seluruh riwayat pemasukan, pengeluaran, dan transfer terintegrasi.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Download className="w-4 h-4 text-cyan-400" /> Ekspor Data (CSV/PDF)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari transaksi atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          <button className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/60">
            <Filter className="w-4 h-4 text-cyan-400" /> Filter Lanjutan
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Tipe</th>
                <th className="p-4">Kategori & Catatan</th>
                <th className="p-4">Konteks (Org/Event)</th>
                <th className="p-4">Akun</th>
                <th className="p-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dummyTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 whitespace-nowrap text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {trx.date}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {trx.type === 'INCOME' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ArrowDownLeft className="w-3 h-3" /> Pemasukan
                      </span>
                    )}
                    {trx.type === 'EXPENSE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <ArrowUpRight className="w-3 h-3" /> Pengeluaran
                      </span>
                    )}
                    {trx.type === 'TRANSFER' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <ArrowRightLeft className="w-3 h-3" /> Transfer
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-100">{trx.category}</p>
                    <p className="text-xs text-slate-400">{trx.notes}</p>
                  </td>
                  <td className="p-4 text-xs text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {trx.context}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 text-xs">{trx.account}</td>
                  <td className={`p-4 text-right font-bold text-base ${
                    trx.type === 'INCOME' ? 'text-emerald-400' :
                    trx.type === 'EXPENSE' ? 'text-rose-400' : 'text-cyan-400'
                  }`}>
                    {trx.type === 'EXPENSE' ? '-' : trx.type === 'INCOME' ? '+' : ''}
                    Rp {trx.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Menampilkan 1-3 dari 3 transaksi</span>
          <div className="flex gap-2">
            <button disabled className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
