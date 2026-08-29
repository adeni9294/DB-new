'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Bell, 
  Activity, 
  User, 
  Lock, 
  CheckCircle2, 
  Info,
  Clock,
  Search
} from 'lucide-react';

export default function AuditAndNotificationPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'audit'>('notifications');

  // Dummy Notifications Data
  const notifications = [
    {
      id: 'N1',
      title: 'Pengeluaran Diatas Limit',
      message: 'Transaksi "Sewa Sound System" senilai Rp 3.500.000 melebihi alokasi anggaran awal.',
      type: 'warning',
      time: '10 Menit yang lalu',
      read: false,
    },
    {
      id: 'N2',
      title: 'Tugas Baru Ditetapkan',
      message: 'Anda ditugaskan pada item "Desain & Cetak Banner Backdrop" oleh Budi Santoso.',
      type: 'info',
      time: '1 Jam yang lalu',
      read: true,
    },
    {
      id: 'N3',
      title: 'Pembayaran Dikonfirmasi',
      message: 'Kas masuk senilai Rp 1.200.000 telah disetujui oleh Bendahara.',
      type: 'success',
      time: '3 Jam yang lalu',
      read: true,
    },
  ];

  // Dummy Audit Logs Data
  const auditLogs = [
    {
      id: 'LOG-8812',
      user: 'Ahmad Ridwan',
      action: 'UPDATE_BUDGET',
      entity: 'Event Seminar 2026',
      ip: '192.168.1.15',
      time: '2026-08-29 21:14:02',
    },
    {
      id: 'LOG-8811',
      user: 'Citra Lestari',
      action: 'APPROVE_TRANSACTION',
      entity: 'TRX-9012',
      ip: '192.168.1.42',
      time: '2026-08-29 19:40:11',
    },
    {
      id: 'LOG-8810',
      user: 'Budi Santoso',
      action: 'CREATE_TASK',
      entity: 'Task-Desain-Banner',
      ip: '192.168.1.8',
      time: '2026-08-29 18:22:45',
    },
  ];

  return (
    <div className="space-y-6 p-6 font-sans text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          Keamanan & Notifikasi
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Pantau pemberitahuan sistem real-time dan rekam jejak audit akses pengguna.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'notifications'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifikasi Sistem
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Audit Security Log
        </button>
      </div>

      {/* TAB 1: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-4 transition-all ${
                n.read 
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' 
                  : 'bg-slate-900/80 border-cyan-500/30 text-white shadow-lg shadow-cyan-950/20'
              }`}
            >
              <div className="mt-0.5">
                {n.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-400" />}
                {n.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{n.title}</h4>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Audit Security Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Entitas Target</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">{log.time}</td>
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-cyan-400" /> {log.user}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">{log.entity}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
