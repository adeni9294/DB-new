"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type MenuItem = {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const menu: MenuItem[] = [
  { key: "dashboard", label: "Ringkasan", href: "/dashboard" },
  { key: "keuangan", label: "Keuangan", href: "/keuangan" },
  { key: "acara", label: "Acara & Kegiatan", href: "/acara" },
  { key: "pengaturan", label: "Pengaturan", href: "/pengaturan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      // Sesuaikan dengan cara token/session Anda disimpan
      localStorage.removeItem("authToken");
      // Navigasi ke halaman login
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col p-4">
      <div className="mb-6">
        <div className="rounded-full w-12 h-12 bg-cyan-500 flex items-center justify-center text-white">A</div>
        <h3 className="mt-2 text-lg font-semibold">Sistem K&B</h3>
        <p className="text-sm text-slate-400">Management Platform</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menu.map((m) => (
          <Link key={m.key} href={m.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive(m.href) ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"
          }`}>
            <span className="w-6 h-6 flex items-center justify-center text-lg">▣</span>
            <span>{m.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-6">
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-slate-800">
            <div className="w-10 h-10 rounded-md bg-slate-700 flex items-center justify-center">U</div>
            <div>
              <div className="font-medium">adeni9294@gmail.com</div>
              <div className="text-xs text-slate-400">adeni9294@gmail.com</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left px-3 py-2 rounded-md bg-transparent border border-rose-600 text-rose-400 hover:bg-rose-700"
            aria-label="Logout"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>
    </aside>
  );
}
