"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

type MenuItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

const menu: MenuItem[] = [
  { key: "dashboard", label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { key: "keuangan", label: "Keuangan", href: "/dashboard/keuangan", icon: Wallet },
  { key: "acara", label: "Acara & Kegiatan", href: "/dashboard/acara", icon: Calendar },
  { key: "pengaturan", label: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // State Minimize Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State Data Profile User (Nama & Email)
  const [userData, setUserData] = useState({
    name: "Ahmad Deni", // fallback nama
    email: "adeni9294@gmail.com",
  });

  // Ambil data profil dinamis dari Oracle DB
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.name || "Ahmad Deni",
            email: data.email || "adeni9294@gmail.com",
          });
        }
      } catch (err) {
        console.error("Gagal memuat profil sidebar:", err);
      }
    }

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.clear();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Inisial avatar huruf depan Nama
  const initial = userData.name ? userData.name.charAt(0).toUpperCase() : "A";

  return (
    <aside
      className={`relative bg-slate-950 border-r border-slate-800/80 text-slate-100 min-h-screen flex flex-col justify-between p-4 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Tombol Minimize Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white p-1.5 rounded-full shadow-lg z-30 transition-transform hover:scale-110"
        title={isCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header & Navigasi */}
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-base shrink-0 shadow-lg shadow-cyan-500/10">
            A
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-white leading-tight truncate">
                Sistem K&B
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Management Platform
              </p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = isActive(m.href);

            return (
              <Link
                key={m.key}
                href={m.href}
                title={isCollapsed ? m.label : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{m.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        {/* Profile Box */}
        <div
          className={`flex items-center gap-3 p-2.5 bg-slate-900/50 border border-slate-800/80 rounded-xl transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? `${userData.name}\n${userData.email}` : undefined}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
            {initial}
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              {/* Nama Lengkap di Atas */}
              <p className="text-xs font-bold text-slate-100 truncate">
                {userData.name}
              </p>
              {/* Email di Bawah */}
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {userData.email}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Keluar (Logout)" : undefined}
          className={`w-full flex items-center gap-2 px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold rounded-xl text-xs transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Keluar (Logout)</span>}
        </button>
      </div>
    </aside>
  );
}
