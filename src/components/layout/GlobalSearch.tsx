'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, CreditCard, CheckSquare, Building, FileText } from 'lucide-react';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari transaksi, acara, organisasi, tugas, atau catatan... (Ctrl+K)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
          {query.trim() === '' ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Ketik sesuatu untuk mulai mencari di seluruh modul K&B.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hasil Pencarian: "{query}"
              </div>
              <div className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl flex items-center gap-3 cursor-pointer transition-all">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Seminar Nasional 2026</p>
                  <p className="text-xs text-slate-400">Acara • 12 September 2026</p>
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl flex items-center gap-3 cursor-pointer transition-all">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">DP Cetak Banner Seminar</p>
                  <p className="text-xs text-slate-400">Transaksi • Rp 450.000</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
