"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  DollarSign,
  BookOpen,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ==========================================
// INTERFACES & TYPES
// ==========================================
interface UserProps {
  id?: any;
  email?: any;
  name?: any;
}

interface DashboardClientProps {
  user?: UserProps;
}

interface AcaraItem {
  id: number | string;
  judul: string;
  tanggal: string;
  waktu?: string;
  lokasi?: string;
  kategori?: string;
}

interface KasSummary {
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
}

interface YasinAyah {
  number: {
    inSurah: number;
  };
  text: {
    ar: string;
    transliteration: {
      id: string;
    };
  };
  translation: {
    id: string;
  };
}

interface Timings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<string>("transparansi");

  // State Kas
  const [kasData, setKasData] = useState<KasSummary>({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
  });
  const [loadingKas, setLoadingKas] = useState<boolean>(false);

  // State Acara
  const [acaraList, setAcaraList] = useState<AcaraItem[]>([]);
  const [loadingAcara, setLoadingAcara] = useState<boolean>(false);
  const [errorAcara, setErrorAcara] = useState<string | null>(null);

  // State Surah Yasin
  const [yasinAyahs, setYasinAyahs] = useState<YasinAyah[]>([]);
  const [loadingYasin, setLoadingYasin] = useState<boolean>(false);

  // State Jadwal Sholat
  const [sholatTimings, setSholatTimings] = useState<Timings | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("Jakarta");
  const [loadingSholat, setLoadingSholat] = useState<boolean>(false);

  // ==========================================
  // FETCHERS
  // ==========================================

  // 1. Fetch Ringkasan Kas
  const fetchKasSummary = useCallback(async () => {
    setLoadingKas(true);
    try {
      const res = await fetch("/api/kas/summary");
      if (res.ok) {
        const data = await res.json();
        setKasData(data);
      }
    } catch (err) {
      console.error("Gagal memuat kas:", err);
    } finally {
      setLoadingKas(false);
    }
  }, []);

  // 2. Fetch Data Acara
  const fetchAcara = useCallback(async () => {
    setLoadingAcara(true);
    setErrorAcara(null);
    try {
      const res = await fetch("/api/acara");
      if (!res.ok) throw new Error("Gagal mengambil data acara");

      const data = await res.json();
      setAcaraList(data);
    } catch (err: any) {
      console.error("❌ Gagal memuat data acara:", err);
      setErrorAcara(err.message || "Gagal memuat agenda acara");
    } finally {
      setLoadingAcara(false);
    }
  }, []);

  // 3. Fetch Surah Yasin (Surah 36)
  const fetchYasin = useCallback(async () => {
    setLoadingYasin(true);
    try {
      const res = await fetch("https://api.quran.gading.dev/surah/36");
      if (res.ok) {
        const result = await res.json();
        setYasinAyahs(result.data.verses);
      }
    } catch (err) {
      console.error("Gagal memuat Yasin:", err);
    } finally {
      setLoadingYasin(false);
    }
  }, []);

  // 4. Fetch Jadwal Sholat via Aladhan API
  const fetchJadwalAladhan = useCallback(async (city: string) => {
    setLoadingSholat(true);
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=11`
      );
      if (res.ok) {
        const result = await res.json();
        setSholatTimings(result.data.timings);
      }
    } catch (err) {
      console.error("Gagal memuat jadwal sholat:", err);
    } finally {
      setLoadingSholat(false);
    }
  }, []);

  // ==========================================
  // EFFECT HOOK
  // ==========================================
  useEffect(() => {
    fetchKasSummary();
    fetchAcara();

    if (activeTab === "yasin" && yasinAyahs.length === 0) {
      fetchYasin();
    }
    if (activeTab === "sholat") {
      fetchJadwalAladhan(selectedCity);
    }
  }, [
    activeTab,
    fetchYasin,
    fetchJadwalAladhan,
    fetchKasSummary,
    fetchAcara,
    selectedCity,
    yasinAyahs.length,
  ]);

  // Format IDR Helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Keuangan & Agenda
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {user?.name ? `Selamat datang, ${user.name}` : "Sistem Informasi & Layanan Informasi Publik"}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("transparansi")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "transparansi"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <DollarSign size={16} /> Transparansi
            </button>
            <button
              onClick={() => setActiveTab("yasin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "yasin"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen size={16} /> Ya-Sin
            </button>
            <button
              onClick={() => setActiveTab("sholat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "sholat"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock size={16} /> Jadwal Sholat
            </button>
          </div>
        </header>

        {/* TAB 1: TRANSPARANSI KAS & AGENDA ACARA */}
        {activeTab === "transparansi" && (
          <div className="space-y-6">
            {/* Cards Ringkasan Kas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase font-bold tracking-wider">Saldo Kas</span>
                  <DollarSign className="text-emerald-400" size={20} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {loadingKas ? "..." : formatRupiah(kasData.saldo)}
                </div>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase font-bold tracking-wider">Total Pemasukan</span>
                  <TrendingUp className="text-teal-400" size={20} />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loadingKas ? "..." : formatRupiah(kasData.pemasukan)}
                </div>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase font-bold tracking-wider">Total Pengeluaran</span>
                  <TrendingDown className="text-rose-400" size={20} />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loadingKas ? "..." : formatRupiah(kasData.pengeluaran)}
                </div>
              </div>
            </div>

            {/* List Agenda Acara Dinamis */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="text-emerald-400" size={20} /> Agenda Kegiatan Terdekat
                </h3>
                <button
                  onClick={fetchAcara}
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Refresh Agenda"
                >
                  <RefreshCw size={16} className={loadingAcara ? "animate-spin" : ""} />
                </button>
              </div>

              {loadingAcara ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                </div>
              ) : errorAcara ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {errorAcara}
                </div>
              ) : acaraList.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Belum ada agenda acara mendatang.
                </p>
              ) : (
                <div className="space-y-3">
                  {acaraList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                    >
                      <div>
                        <h4 className="font-semibold text-white text-base">{item.judul}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.tanggal} {item.waktu ? `• ${item.waktu}` : ""}{" "}
                          {item.lokasi ? `• ${item.lokasi}` : ""}
                        </p>
                      </div>
                      {item.kategori && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.kategori}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SURAH YA-SIN */}
        {activeTab === "yasin" && (
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-emerald-400" size={22} /> Surah Ya-Sin
            </h2>

            {loadingYasin ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-800">
                {yasinAyahs.map((ayah) => (
                  <div key={ayah.number.inSurah} className="pt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="w-8 h-8 rounded-full bg-slate-800 text-xs font-bold text-emerald-400 flex items-center justify-center">
                        {ayah.number.inSurah}
                      </span>
                      <p className="text-2xl sm:text-3xl font-serif text-right text-emerald-300 leading-relaxed">
                        {ayah.text.ar}
                      </p>
                    </div>
                    <p className="text-xs text-emerald-500/80 italic">
                      {ayah.text.transliteration.id}
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {ayah.translation.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JADWAL SHOLAT */}
        {activeTab === "sholat" && (
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-emerald-400" size={22} /> Jadwal Sholat
              </h2>

              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <MapPin size={16} className="text-emerald-400" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Jakarta" className="bg-slate-900">Jakarta</option>
                  <option value="Surabaya" className="bg-slate-900">Surabaya</option>
                  <option value="Bandung" className="bg-slate-900">Bandung</option>
                  <option value="Yogyakarta" className="bg-slate-900">Yogyakarta</option>
                  <option value="Medan" className="bg-slate-900">Medan</option>
                  <option value="Makassar" className="bg-slate-900">Makassar</option>
                </select>
              </div>
            </div>

            {loadingSholat ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              </div>
            ) : sholatTimings ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { name: "Subuh", time: sholatTimings.Fajr },
                  { name: "Dzuhur", time: sholatTimings.Dhuhr },
                  { name: "Ashar", time: sholatTimings.Asr },
                  { name: "Maghrib", time: sholatTimings.Maghrib },
                  { name: "Isya", time: sholatTimings.Isha },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center"
                  >
                    <span className="text-xs text-slate-400 font-medium">{item.name}</span>
                    <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
