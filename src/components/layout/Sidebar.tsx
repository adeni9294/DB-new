'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Calendar, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';

interface UserSession {
  email?: string;
  name?: string;
  role?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  // Ambil data user yang sedang login secara dinamis
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const res = await fetch('/api/auth/me'); // Atau sesuaikan dengan endpoint session di project kamu (misal /api/auth/session)
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        }
      } catch (err) {
        console.error('Gagal mengambil data session user:', err);
      }
    }
    fetchUserSession();
  }, []);

  const navItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Keuangan', href: '/dashboard/keuangan', icon: Wallet },
    { name: 'Acara & Kegiatan', href: '/dashboard/acara', icon: Calendar },
    { name: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Ambil inisial huruf depan email/nama
  const userEmail = user?.email || 'Guest';
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <aside 
      className={`relative h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between p-4 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Tombol Toggle Collapse/Expand */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white p-1 rounded-full shadow-md z-10 transition-colors"
        title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header & Navigasi */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-all">
              <h1 className="font-bold text-slate-100 text-sm truncate">Sistem K&B</h1>
              <p className="text-xs text-slate-400 truncate">Management Platform</p>
            </div>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Section Bawah / User Profile & Logout (Dinamis) */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">{userEmail}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Keluar (Logout)' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-medium transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Keluar (Logout)</span>}
        </button>
      </div>
    </aside>
  );
}
