'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Plus, 
  ShieldCheck, 
  ChevronRight, 
  MoreVertical,
  Mail
} from 'lucide-react';

export default function OrganizationStructurePage() {
  // Dummy Data Organisasi untuk Ilustrasi Tampilan
  const activeOrg = {
    name: 'K&B Community Development',
    description: 'Organisasi pengelola aktivitas komunitas dan kepanitiaan tahunan.',
    totalMembers: 12,
    totalEvents: 4,
  };

  const structureTree = [
    { title: 'Ketua Umum', name: 'Ahmad Ridwan', email: 'ahmad@sat.com', level: 'Inti' },
    { title: 'Sekretaris', name: 'Budi Santoso', email: 'budi@sat.com', level: 'Inti' },
    { title: 'Bendahara', name: 'Citra Lestari', email: 'citra@sat.com', level: 'Inti' },
    { title: 'Divisi Acara (Koordinator)', name: 'Deni Kurniawan', email: 'deni@sat.com', level: 'Divisi' },
    { title: 'Divisi Acara (Anggota)', name: 'Eko Prasetyo', email: 'eko@sat.com', level: 'Divisi' },
    { title: 'Divisi Humas & Media', name: 'Fajar Nugraha', email: 'fajar@sat.com', level: 'Divisi' },
  ];

  return (
    <div className="space-y-6 p-6 font-sans text-slate-100">
      {/* Header Organisasi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Struktur Organisasi
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Kelola tata kelola kepengurusan, panitia, dan pembagian jabatan.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
        </div>
      </div>

      {/* Info Card Organisasi */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Organisasi Aktif
          </div>
          <h2 className="text-xl font-bold text-white">{activeOrg.name}</h2>
          <p className="text-sm text-slate-400 max-w-xl">{activeOrg.description}</p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <span className="text-xs text-slate-500 block">Total Anggota</span>
            <span className="text-xl font-extrabold text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-cyan-400" /> {activeOrg.totalMembers}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Acara Dikelola</span>
            <span className="text-xl font-extrabold text-white flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> {activeOrg.totalEvents}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Hirarki Struktur Pengurus */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" /> Susunan Pengurus & Panitia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structureTree.map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                    item.level === 'Inti' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.title}
                  </span>
                  <h4 className="text-base font-semibold text-white mt-2">{item.name}</h4>
                </div>
                <button className="text-slate-500 hover:text-slate-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {item.email}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
