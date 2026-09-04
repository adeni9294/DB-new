"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Calendar, MapPin, 
  BookOpen, Compass, Clock, LogIn, Sparkles, Navigation,
  Loader2, RefreshCw, Volume2, Search, AlertCircle
} from "lucide-react";

type UserType = {
  id?: number | string;
  email?: string;
  name?: string;
  role?: string;
};

interface DashboardClientProps {
  user?: UserType;
}

interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: { [key: string]: string };
}

interface JadwalSholatAladhan {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  ReadableDate: string;
}

interface KasSummaryType {
  totalSaldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  loading: boolean;
  error: string | null;
}

interface EventItem {
  id: number | string;
  title: string;
  date_description: string; // contoh: "Setiap Kamis Malam • Ba'da Isya" atau "12 Oktober 2026"
  category?: string; // contoh: "Rutin", "Khusus", "Haul"
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"transparansi" | "yasin" | "sholat" | "haul">("transparansi");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  // State Data - Transparansi Kas (REAL DATA dari Oracle DB)
  const [kasSummary, setKasSummary] = useState<KasSummaryType>({
    totalSaldo: 0,
    pemasukanBulanIni: 0,
    pengeluaranBulanIni: 0,
    loading: true,
    error: null
  });

  // State Data - Agenda / Acara (REAL DATA dari API)
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);

  // State Real API - Yasin
  const [yasinAyahs, setYasinAyahs] = useState<Ayah[]>([]);
  const [loadingYasin, setLoadingYasin] = useState<boolean>(false);
  const [errorYasin, setErrorYasin] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // State Real API Aladhan - Jadwal Sholat
  const [jadwalSholat, setJadwalSholat] = useState<JadwalSholatAladhan | null>(null);
  const [cityInput, setCityInput] = useState<string>("Jakarta");
  const [selectedCity, setSelectedCity] = useState<string>("Jakarta");
  const [loadingSholat, setLoadingSholat] = useState<boolean>(false);
  const [errorSholat, setErrorSholat] = useState<string | null>(null);

  // State Kompas Kiblat Real Sensor
  const [heading, setHeading] = useState<number | null>(null);
  const [kompasActive, setKompasActive] = useState<boolean>(false);

  // Fetch Real Data Kas Summary dari Oracle DB via API
  const fetchKasSummary = useCallback(async () => {
    setKasSummary(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/dashboard/summary');
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      setKasSummary({
        totalSaldo: data.totalSaldo || 0,
        pemasukanBulanIni: data.pemasukanBulanIni || 0,
        pengeluaranBulanIni: data.pengeluaranBulanIni || 0,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error('❌ Gagal mengambil kas summary:', err);
      setKasSummary(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Gagal memuat data kas'
      }));
    }
  }, []);

  // Fetch Real Data Agenda / Acara
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    setErrorEvents(null);
    try {
      const res = await fetch('/api/events'); // Sesuaikan endpoint API acara Anda (misal: /api/acara)
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      // Asumsi API mengembalikan array data acara [{ id, title, date_description, category }]
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err: any) {
      console.error('❌ Gagal mengambil data acara:', err);
      setErrorEvents(err.message || 'Gagal memuat agenda acara');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  // 1. Fetch Real Data Surah Yasin (Surah No. 36)
  const fetchYasin = useCallback(async () => {
    setLoadingYasin(true);
    setErrorYasin(null);
    try {
      const res = await fetch("https://equran.id/api/v2/surat/36");
      const json = await res.json();
      if (json.code === 200 && json.data?.ayat) {
        setYasinAyahs(json.data.ayat);
      } else {
        throw new Error("Gagal mengambil data Yasin");
      }
    } catch (err: any) {
      setErrorYasin(err.message || "Terjadi kesalahan saat memuat Yasin");
    } finally {
      setLoadingYasin(false);
    }
  }, []);

  // 2. Fetch Real Data Jadwal Sholat dari ALADHAN API (Method 20 = Kemenag RI)
  const fetchJadwalAladhan = useCallback(async (kota: string) => {
    setLoadingSholat(true);
    setErrorSholat(null);
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateStr = `${dd}-${mm}-${yyyy}`;

      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(kota)}&country=Indonesia&method=20`
      );
      const json = await res.json();

      if (json.code === 200 && json.data?.timings) {
        const timings = json.data.timings;
        setJadwalSholat({
          Fajr: timings.Fajr,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
          Imsak: timings.Imsak,
          ReadableDate: json.data.date.readable,
        });
      } else {
        throw new Error("Kota tidak ditemukan atau API bermasalah.");
      }
    } catch (err: any) {
      setErrorSholat(err.message || "Gagal memuat jadwal sholat Aladhan.");
    } finally {
      setLoadingSholat(false);
    }
  }, []);

  useEffect(() => {
    fetchKasSummary();
    fetchEvents();
    
    if (activeTab === "yasin" && yasinAyahs.length === 0) {
      fetchYasin();
    }
    if (activeTab === "sholat") {
      fetchJadwalAladhan(selectedCity);
    }
  }, [activeTab, fetchYasin, fetchJadwalAladhan, fetchKasSummary, fetchEvents, selectedCity, yasinAyahs.length]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setSelectedCity(cityInput.trim());
    }
  };

  // Handler Kompas Kiblat Sensor Device
  const startCompass = () => {
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", (e) => {
        if (e.alpha !== null) {
          setHeading(Math.round(e.alpha));
          setKompasActive(true);
        }
      });
    } else {
      alert("Fitur kompas tidak didukung di perangkat ini.");
    }
  };

  const playAudio = (url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    setPlayingAudio(url);
    audio.play();
    audio.onended = () => setPlayingAudio(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-emerald-900/40">
              K&B
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight text-white">Portal K&B</h1>
              <p className="text-xs text-emerald-400">Transparansi & Layanan Publik</p>
            </div>
          </div>

          <a 
            href={user ? "/dashboard" : "/login"} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
          >
            <LogIn size={16} />
            <span>{user ? `Halo, ${user.name || 'Pengurus'}` : "Login Pengurus"}</span>
          </a>
        </div>
      </header>

      {/* HERO BANNER & TABS */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles size={14} /> Selamat Datang Warga & Jemaah
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Portal Informasi & Layanan Keagamaan
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Wadah transparansi kas organisasi, bacaan Yasin digital, jadwal sholat otomatis Aladhan, serta informasi kegiatan warga.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTab("transparansi")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === "transparansi" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Wallet size={16} /> Transparansi Kas
            </button>
            <button
              onClick={() => setActiveTab("yasin")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === "yasin" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <BookOpen size={16} /> Yasin & Audio
            </button>
            <button
              onClick={() => setActiveTab("sholat")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === "sholat" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" 
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Clock size={16} /> Sholat & Kiblat
            </button>
            <button
              onClick={() => setActiveTab("haul")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
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

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* TAB 1: TRANSPARANSI KAS & AGENDA */}
        {activeTab === "transparansi" && (
          <div className="space-y-6">
            {kasSummary.loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              </div>
            ) : kasSummary.error ? (
              <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span className="text-sm">{kasSummary.error}</span>
                </div>
                <button 
                  onClick={fetchKasSummary} 
                  className="p-2 bg-rose-800 rounded-lg hover:bg-rose-700 transition"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                      <span className="text-sm font-medium">Sisa Kas Utama</span>
                      <Wallet size={20} className="text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      Rp {kasSummary.totalSaldo.toLocaleString("id-ID")}
                    </p>
                    <span className="text-xs text-emerald-400 mt-2 inline-block">Terverifikasi Oracle DB</span>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                      <span className="text-sm font-medium">Pemasukan Bulan Ini</span>
                      <ArrowUpRight size={20} className="text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">
                      + Rp {kasSummary.pemasukanBulanIni.toLocaleString("id-ID")}
                    </p>
                    <span className="text-xs text-slate-500 mt-2 inline-block">Total Kas Masuk</span>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                      <span className="text-sm font-medium">Pengeluaran Bulan Ini</span>
                      <ArrowDownRight size={20} className="text-rose-400" />
                    </div>
                    <p className="text-3xl font-bold text-rose-400">
                      - Rp {kasSummary.pengeluaranBulanIni.toLocaleString("id-ID")}
                    </p>
                    <span className="text-xs text-slate-500 mt-2 inline-block">Total Kas Keluar</span>
                  </div>
                </div>

                {/* AGENDA KEGIATAN DYNAMIC */}
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Calendar className="text-emerald-400" size={20} /> Agenda Kegiatan Terdekat
                    </h3>
                    <button 
                      onClick={fetchEvents}
                      className="p-1.5 text-slate-400 hover:text-white transition"
                      title="Refresh Acara"
                    >
                      <RefreshCw size={14} className={loadingEvents ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {loadingEvents ? (
                    <div className="flex justify-center items-center py-6 text-slate-400 gap-2">
                      <Loader2 className="animate-spin text-emerald-500" size={20} />
                      <span className="text-sm">Memuat agenda acara...</span>
                    </div>
                  ) : errorEvents ? (
                    <p className="text-sm text-rose-400 py-2">{errorEvents}</p>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-slate-400 italic py-2">Belum ada agenda kegiatan terdekat.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div 
                          key={event.id}
                          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                        >
                          <div>
                            <h4 className="font-semibold text-white">{event.title}</h4>
                            <p className="text-xs text-slate-400">{event.date_description}</p>
                          </div>
                          {event.category && (
                            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {event.category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: SURAT YASIN */}
        {activeTab === "yasin" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 sticky top-20 z-40">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-400" />
                <span className="font-bold text-sm text-white">Surat Yasin (83 Ayat)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button onClick={() => setFontSize("sm")} className={`px-2.5 py-1 rounded-lg cursor-pointer ${fontSize === 'sm' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Kecil</button>
                <button onClick={() => setFontSize("md")} className={`px-2.5 py-1 rounded-lg cursor-pointer ${fontSize === 'md' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Sedang</button>
                <button onClick={() => setFontSize("lg")} className={`px-2.5 py-1 rounded-lg cursor-pointer ${fontSize === 'lg' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Besar</button>
              </div>
            </div>

            {loadingYasin && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-sm">Memuat Al-Qur'an (Surat Yasin)...</p>
              </div>
            )}

            {errorYasin && (
              <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>{errorYasin}</span>
                </div>
                <button onClick={fetchYasin} className="p-2 bg-rose-800 rounded-lg hover:bg-rose-700">
                  <RefreshCw size={16} />
                </button>
              </div>
            )}

            {!loadingYasin && yasinAyahs.map((ayat) => (
              <div key={ayat.nomorAyat} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {ayat.nomorAyat}
                    </span>
                    {ayat.audio && (
                      <button 
                        onClick={() => playAudio(ayat.audio?.["05"] || ayat.audio?.["01"])}
                        className={`p-2 rounded-full border transition cursor-pointer ${
                          playingAudio === (ayat.audio?.["05"] || ayat.audio?.["01"]) 
                            ? "bg-emerald-600 text-white border-emerald-500" 
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className={`font-serif text-right leading-loose text-emerald-100 ${
                    fontSize === 'sm' ? 'text-2xl' : fontSize === 'md' ? 'text-3xl' : 'text-4xl'
                  }`}>
                    {ayat.teksArab}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 space-y-1">
                  <p className="text-emerald-400/90 text-sm italic">{ayat.teksLatin}</p>
                  <p className="text-slate-300 text-sm">{ayat.teksIndonesia}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: JADWAL SHOLAT & KIBLAT (ALADHAN API REAL) */}
        {activeTab === "sholat" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* CARI KOTA VIA ALADHAN */}
            <form onSubmit={handleCitySearch} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Search size={14} /> Cari Nama Kota / Daerah:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Contoh: Jakarta, Surabaya, Bandung, Medan..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition cursor-pointer"
                >
                  Cari
                </button>
              </div>
            </form>

            {/* HASIL JADWAL SHOLAT */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="text-left">
                  <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">Jadwal Sholat (Aladhan API)</span>
                  <h3 className="text-2xl font-bold text-white capitalize">{selectedCity}</h3>
                </div>
                {jadwalSholat && (
                  <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    {jadwalSholat.ReadableDate}
                  </span>
                )}
              </div>
              
              {loadingSholat ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>
              ) : errorSholat ? (
                <div className="p-4 bg-rose-950/40 text-rose-300 text-sm rounded-xl border border-rose-800">
                  {errorSholat}
                </div>
              ) : jadwalSholat ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400">Subuh</span>
                    <p className="text-xl font-bold text-white">{jadwalSholat.Fajr.split(" ")[0]}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400">Dzuhur</span>
                    <p className="text-xl font-bold text-white">{jadwalSholat.Dhuhr.split(" ")[0]}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400">Ashar</span>
                    <p className="text-xl font-bold text-white">{jadwalSholat.Asr.split(" ")[0]}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400">Maghrib</span>
                    <p className="text-xl font-bold text-white">{jadwalSholat.Maghrib.split(" ")[0]}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400">Isya</span>
                    <p className="text-xl font-bold text-white">{jadwalSholat.Isha.split(" ")[0]}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* SENSOR KIBLAT */}
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
              <Compass 
                size={56} 
                className={`mx-auto text-emerald-400 transition-transform duration-300 ${kompasActive ? '' : 'animate-pulse'}`} 
                style={{ transform: heading !== null ? `rotate(${heading}deg)` : 'none' }}
              />
              <div>
                <h3 className="font-bold text-white text-lg">Sensor Arah Kiblat</h3>
                <p className="text-xs text-slate-400">
                  {heading !== null ? `Arah Kompas HP: ${heading}°` : "Klik tombol di bawah untuk mengaktifkan sensor arah kompas HP."}
                </p>
              </div>
              <button 
                onClick={startCompass}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition cursor-pointer"
              >
                {kompasActive ? "Sensor Aktif" : "Aktifkan Kompas HP"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PETA & LOKASI REAL */}
        {activeTab === "haul" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                    Lokasi Kegiatan
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">Masjid / Majelis K&B</h3>
                  <p className="text-slate-400 text-sm">Petunjuk Lokasi Google Maps Real</p>
                </div>
                <a 
                  href="https://maps.google.com/?q=Masjid" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
                >
                  <Navigation size={16} /> Buka Peta Google
                </a>
              </div>

              {/* IFRAME GOOGLE MAPS REAL */}
              <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-800">
                <iframe
                  title="Google Maps Location"
                  src="https://maps.google.com/maps?q=Monas%20Jakarta&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-900/80 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Organisasi K&B. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
