'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Filter,
  DollarSign
} from 'lucide-react';
import { generateCSVReport, downloadFile, TransactionReportRow } from '@/lib/reports/exportEngine';

export default function ReportingPage() {
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [reportType, setReportType] = useState<'financial' | 'event' | 'budget'>('financial');

  // Dummy sample data transaksi
  const sampleTransactions: TransactionReportRow[] = [
    {
      date: '2026-08-10',
      category: 'Sponsor & Donasi',
      type: 'INCOME',
      amount: 5000000,
      description: 'Sponsorship Dana Usaha PT Satya Enterprise',
      actor: 'Citra Lestari',
    },
    {
      date: '2026-08-15',
      category: 'Perlengkapan',
      type: 'EXPENSE',
      amount: 1800000,
      description: 'Pembelian Banner & Spanduk Acara',
      actor: 'Fajar Nugraha',
    },
    {
      date: '2026-08-20',
      category: 'Konsumsi',
      type: 'EXPENSE',
      amount: 1250000,
      description: 'Konsumsi Rapat Panitia Inti',
      actor: 'Deni Kurniawan',
    },
  ];

  const handleExportCSV = () => {
    const csvData = generateCSVReport(sampleTransactions);
    const fileName = `Laporan_${reportType.toUpperCase()}_${startDate}_sd_${endDate}.csv`;
    downloadFile(csvData, fileName);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Pusat Laporan & Ekspor Data
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Cetak dan unduh rekapitulasi keuangan, alokasi anggaran, serta arsip kegiatan.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel / CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak PDF
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Jenis Laporan</label>
          <select
            value={reportType}
            onChange={(e: any) => setReportType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="financial">Laporan Arus Kas & Transaksi</option>
            <option value="budget">Laporan Realisasi Anggaran</option>
            <option value="event">Laporan Pelaksanaan Acara</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Tanggal Selesai</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Pratinjau Tabel Data Laporan */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Pratinjau Data Laporan
          </h3>
          <span className="text-xs text-slate-400 font-mono">Periode: {startDate} s/d {endDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4 text-right">Jumlah (IDR)</th>
                <th className="py-3 px-4">Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleTransactions.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-slate-400">{row.date}</td>
                  <td className="py-3 px-4 font-medium text-white">{row.category}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      row.type === 'INCOME' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-semibold ${
                    row.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    Rp {row.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{row.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
