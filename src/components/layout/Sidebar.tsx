"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type MenuItem = {
  key: string;
  label: string;
  href: string;
};

const menu: MenuItem[] = [
  { key: "dashboard", label: "Ringkasan", href: "/dashboard" },
  { key: "keuangan", label: "Keuangan", href: "/dashboard/keuangan" },
  { key: "acara", label: "Acara & Kegiatan", href: "/dashboard/acara" },
  { key: "pengaturan", label: "Pengaturan", href: "/dashboard/pengaturan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // State untuk minimize & data user dinamis
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string }>({
    name: "Loading...",
    email: "...",
  });

  // Ambil data profil (Nama & Email) dari Oracle via API Profile
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.name || "Pengguna",
            email: data.email || "",
          });
        } else {
          setUserData({ name: "Pengguna", email: "" });
        }
      } catch (err) {
        console.error("Gagal memuat profil sidebar:", err);
        setUserData({ name: "Pengguna", email: "" });
      }
    }

    fetchUserData();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("email");
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

  // Inisial avatar berdasarkan Nama Lengkap
  const initial =
    userData.name && userData.name !== "Loading..."
      ? userData.name.charAt(0).toUpperCase()
      : "U";

  return (
    <aside
      className={`relative bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between p-4 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Tombol Minimize / Expand */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white p-1 rounded-full shadow-md z-10 transition-colors"
        title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {/* Bagian Atas: Header & Menu Navigasi */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full w-10 h-10 bg-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h3 className="text-base font-semibold truncate">Sistem K&B</h3>
              <p className="text-xs text-slate-400 truncate">Management Platform</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {menu.map((m) => (
            <Link
              key={m.key}
              href={m.href}
              title={isCollapsed ? m.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive(m.href) ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <span className="w-6 h-6 flex items-center justify-center text-lg shrink-0">▣</span>
              {!isCollapsed && <span className="truncate">{m.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bagian Bawah: Profile & Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        {/* Box Profil */}
        <div
          className={`flex items-center gap-3 p-3 rounded-md bg-slate-800 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? `${userData.name}\n${userData.email}` : undefined}
        >
          <div className="w-9 h-9 rounded-md bg-slate-700 flex items-center justify-center font-bold text-cyan-400 shrink-0">
            {initial}
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              {/* Nama Lengkap di Atas */}
              <div className="font-bold text-xs text-slate-100 truncate">
                {userData.name}
              </div>
              {/* Email di Bawah */}
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {userData.email}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title={isCollapsed ? "Keluar (Logout)" : undefined}
          className={`w-full text-left px-3 py-2 rounded-md bg-transparent border border-rose-600 text-rose-400 hover:bg-rose-700 hover:text-white transition-colors flex items-center ${
            isCollapsed ? "justify-center" : "gap-2"
          }`}
        >
          <span className="text-base">➔</span>
          {!isCollapsed && <span>Keluar (Logout)</span>}
        </button>
      </div>
    </aside>
  );
}
