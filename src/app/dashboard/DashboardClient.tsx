"use client";

import React, { useState, useEffect } from "react";
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Calendar, MapPin, 
  BookOpen, Compass, Clock, LogIn, Sparkles, Navigation, Phone, MessageSquare
} from "lucide-react";

// Sample Data Dummy untuk Yasin & Tahlil
const DATA_YASIN = [
  { no: 1, arab: "يسٓ", latin: "Yā Sīn.", indo: "Ya Sin." },
  { no: 2, arab: "وَٱلْقُرْءَانِ ٱلْحَكِيمِ", latin: "Wal-qur'ānil-ḥakīm.", indo: "Demi Al-Qur'an yang penuh hikmah," },
  { no: 3, arab: "إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ", latin: "Innaka laminal-mursalīn.", indo: "Sungguh, engkau (Muhammad) adalah salah seorang dari rasul-rasul," },
  { no: 4, arab: "عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ", latin: "'Alā ṣirāṭim mustaqīm.", indo: "(yang berada) di atas jalan yang lurus," }
];

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState<"transparansi" | "yasin" | "sholat" | "haul">("transparansi");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [userLocation, setUserLocation] = useState<string>("Mencari lokasi...");

  // Geolocation Sederhana untuk Kota
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setUserLocation("Jakarta & Sekitarnya"),
        () => setUserLocation("Lokasi Default (Jakarta)")
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. HEADER & TOP NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-900/40">
              K&B
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight text-white">Portal K&B</h1>
              <p className="text-xs text-emerald-400">Transparansi & Layanan Publik</p>
            </div>
          </div>

          <a 
            href="/login" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
          >
            <LogIn size={16} />
            <span>Login Pengurus</span>
          </a>
        </div>
      </header>

      {/* 2. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles size={14} /> Selamat Datang Warga & Jemaah
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Portal Informasi & Layanan Keagamaan
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Wadah transparansi kas organisasi, amalan ibadah harian, jadwal sholat, hingga petunjuk lokasi kegiatan masyarakat secara online.
          </p>

          {/* TAB NAVIGATION */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTab("transparansi")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === "transparansi" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Wallet size={16} /> Transparansi Kas
            </button>
            <button
              onClick={() => setActiveTab("yasin")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === "yasin" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <BookOpen size={16} /> Yasin & Tahlil
            </button>
            <button
              onClick={() => setActiveTab("sholat")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === "sholat" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Clock size={16} /> Sholat & Kiblat
            </button>
            <button
              onClick={() => setActiveTab("haul")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === "haul" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <MapPin size={16} /> Info Haul & Peta
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* TAB 1: TRANSPARANSI KAS */}
        {activeTab === "transparansi" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-sm font-medium">Sisa Kas Utama</span>
                  <Wallet size={20} className="text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-white">Rp 12.500.000</p>
                <span className="text-xs text-emerald-400 mt-2 inline-block">Update Real-Time</span>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-sm font-medium">Pemasukan Bulan Ini</span>
                  <ArrowUpRight size={20} className="text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-emerald-400">+ Rp 3.200.000</p>
                <span className="text-xs text-slate-500 mt-2 inline-block">Dari 15 Donatur/Iuran</span>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-sm font-medium">Pengeluaran Bulan Ini</span>
                  <ArrowDownRight size={20} className="text-rose-400" />
                </div>
                <p className="text-3xl font-bold text-rose-400">- Rp 1.100.000</p>
                <span className="text-xs text-slate-500 mt-2 inline-block">Untuk Kegiatan & Operasional</span>
              </div>
            </div>

            {/* AGENDA SIKAP / PROGRAM KERJA */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="text-emerald-400" size={20} /> Agenda Kegiatan Mendatang
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-white">Pengajian Rutin Malam Jumat & Yasinan</h4>
                    <p className="text-xs text-slate-400">Kamis Malam, 20:00 WIB • Masjid / Musholla K&B</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Rutin</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KITAB YASIN & TAHLIL */}
        {activeTab === "yasin" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            {/* TOOLBAR BACAAN */}
            <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 sticky top-20 z-40">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-400" />
                <span className="font-bold text-sm text-white">Surat Yasin</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Ukuran Teks:</span>
                <button onClick={() => setFontSize("sm")} className={`px-2.5 py-1 rounded-lg ${fontSize === 'sm' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Kecil</button>
                <button onClick={() => setFontSize("md")} className={`px-2.5 py-1 rounded-lg ${fontSize === 'md' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Sedang</button>
                <button onClick={() => setFontSize("lg")} className={`px-2.5 py-1 rounded-lg ${fontSize === 'lg' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Besar</button>
              </div>
            </div>

            {/* DAFTAR AYAT */}
            <div className="space-y-4">
              {DATA_YASIN.map((ayat) => (
                <div key={ayat.no} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {ayat.no}
                    </span>
                    <p className={`font-serif text-right leading-loose text-emerald-200 ${
                      fontSize === 'sm' ? 'text-2xl' : fontSize === 'md' ? 'text-3xl' : 'text-4xl'
                    }`}>
                      {ayat.arab}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 space-y-1">
                    <p className="text-emerald-400/90 text-sm italic">{ayat.latin}</p>
                    <p className="text-slate-300 text-sm">{ayat.indo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: JADWAL SHOLAT & KIBLAT */}
        {activeTab === "sholat" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs text-slate-400">Lokasi Anda</span>
              <p className="font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                <MapPin size={16} /> {userLocation}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { nama: "Subuh", waktu: "04:38" },
                { nama: "Dzuhur", waktu: "11:57" },
                { nama: "Ashar", waktu: "15:15" },
                { nama: "Maghrib", waktu: "17:58" },
                { nama: "Isya", waktu: "19:08" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-400">{s.nama}</span>
                  <p className="text-lg font-bold text-white">{s.waktu}</p>
                </div>
              ))}
            </div>

            {/* KOMPAS KIBLAT */}
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
              <Compass size={48} className="mx-auto text-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-lg">Arah Kiblat</h3>
                <p className="text-xs text-slate-400">Gunakan sensor kompas HP Anda untuk menemukan petunjuk kiblat.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition">
                Aktifkan Kompas Kiblat
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PETA & LOKASI HAUL */}
        {activeTab === "haul" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                    Acara Akbar Mendatang
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">Haul Akbar & Pengajian Umum K&B</h3>
                  <p className="text-slate-400 text-sm">Lokasi: Lapangan Utama / Kompleks K&B</p>
                </div>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
                >
                  <Navigation size={16} /> Buka Google Maps
                </a>
              </div>

              {/* EMBED GOOGLE MAPS PLACEHOLDER */}
              <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
                <MapPin size={32} className="text-emerald-500" />
                <p className="text-sm">Peta Interaktif Google Maps / Denah Lokasi Haul</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Organisasi K&B. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
