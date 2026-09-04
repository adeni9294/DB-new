"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Compass,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

// --- TypeScript Interfaces ---
interface Ayah {
  number: {
    inSurah: number;
  };
  text: {
    ar: string;
    read: string;
  };
  translation: {
    id: string;
  };
  audio: {
    primary: string;
  };
}

interface SurahData {
  number: number;
  name: {
    short: string;
    long: string;
    transliteration: {
      id: string;
    };
    translation: {
      id: string;
    };
  };
  numberOfVerses: number;
  verses: Ayah[];
}

interface JadwalSholatAladhan {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface KasSummaryType {
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
}

interface EventItem {
  id: string | number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
}

export default function DashboardClient() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<"jadwal" | "quran" | "kompas" | "kas" | "agenda">("jadwal");

  // Quran State
  const [surahList, setSurahList] = useState<any[]>([]);
  const [selectedSurahNo, setSelectedSurahNo] = useState<number>(1);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loadingQuran, setLoadingQuran] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Audio Reference (Mencegah Memory Leak)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Compass State
  const [heading, setHeading] = useState<number>(0);
  const [kompasActive, setKompasActive] = useState<boolean>(false);

  // Location & Prayer Time State
  const [locationName, setLocationName] = useState<string>("Mencari lokasi...");
  const [jadwalSholat, setJadwalSholat] = useState<JadwalSholatAladhan | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);

  // Financial & Agenda State
  const [kasSummary, setKasSummary] = useState<KasSummaryType>({ pemasukan: 0, pengeluaran: 0, saldo: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);

  // --- Fetch Surah List ---
  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      ? fetch("https://equran.id/api/v2/surat")
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 200) setSurahList(data.data);
          })
          .catch((err) => console.error("Error fetching surah list:", err))
      : null;
  }, []);

  // --- Fetch Selected Surah Details ---
  useEffect(() => {
    if (!selectedSurahNo) return;
    setLoadingQuran(true);
    fetch(`https://equran.id/api/v2/surat/${selectedSurahNo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setSurahData(data.data);
        }
      })
      .catch((err) => console.error("Error fetching surah data:", err))
      .finally(() => setLoadingQuran(false));
  }, [selectedSurahNo]);

  // --- Fetch Prayer Times & Location ---
  const fetchPrayerTimes = useCallback((latitude: number, longitude: number) => {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          const timings = data.data.timings;
          setJadwalSholat({
            Fajr: timings.Fajr,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
          });
        }
      })
      .catch((err) => console.error("Error fetching prayer times:", err));

    // Reverse Geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
      .then((res) => res.json())
      .then((data) => {
        const city = data.address.city || data.address.town || data.address.suburb || "Lokasi Anda";
        setLocationName(city);
      })
      .catch(() => setLocationName("Lokasi Terdeteksi"));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude),
        () => {
          setLocationName("Jakarta (Default)");
          fetchPrayerTimes(-6.2088, 106.8456); // Fallback ke Jakarta
        }
      );
    } else {
      setLocationName("Jakarta (Default)");
      fetchPrayerTimes(-6.2088, 106.8456);
    }
  }, [fetchPrayerTimes]);

  // --- Fetch Kas & Agenda Internal ---
  useEffect(() => {
    fetch("/api/kas/summary")
      .then((res) => res.json())
      .then((data) => setKasSummary(data))
      .catch(() => setKasSummary({ pemasukan: 15000000, pengeluaran: 4500000, saldo: 10500000 }));

    fetch("/api/events/upcoming")
      .then((res) => res.json())
      .then((result) => setUpcomingEvents(result.data || result.events || []))
      .catch(() =>
        setUpcomingEvents([
          { id: 1, title: "Kajian Subuh Bersama Ust. Ahmad", date: "2026-04-20", time: "04:30 WIB", location: "Ruang Utama" },
          { id: 2, title: "Santunan Anak Yatim Bulanan", date: "2026-04-25", time: "16:00 WIB", location: "Aula Masjid" },
        ])
      );
  }, []);

  // --- Audio Player Handlers ---
  const playAudio = (url?: string) => {
    if (!url) return;

    // Hentikan audio yang sedang berjalan
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // Toggle off jika mengklik audio yang sama
    if (playingAudio === url) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;
    setPlayingAudio(url);

    audio.play().catch((err) => console.error("Gagal memutar audio:", err));
    audio.onended = () => {
      setPlayingAudio(null);
      currentAudioRef.current = null;
    };
  };

  // --- Compass Handlers (iOS & Android Compatible) ---
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.alpha !== null) {
      setHeading(Math.round(e.alpha));
      setKompasActive(true);
    }
  }, []);

  const startCompass = async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      alert("Fitur kompas tidak didukung di perangkat ini.");
      return;
    }

    // Penanganan khusus permission iOS (Safari)
    const DeviceOrientationEventiOS = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof DeviceOrientationEventiOS.requestPermission === "function") {
      try {
        const response = await DeviceOrientationEventiOS.requestPermission();
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        } else {
          alert("Izin akses sensor kompas ditolak.");
        }
      } catch (error) {
        console.error("Gagal meminta izin kompas:", error);
      }
    } else {
      // Browser Standar / Android
      window.addEventListener("deviceorientation", handleOrientation);
    }
  };

  // Cleanup compass listener
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleOrientation]);

  // Filter surah
  const filteredSurahList = surahList.filter(
    (s) =>
      s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nomor.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">Islamic Portal</h1>
              <div className="flex items-center text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
                <span>{locationName}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden md:flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: "jadwal", label: "Jadwal Sholat", icon: Clock },
              { id: "quran", label: "Al-Qur'an", icon: BookOpen },
              { id: "kompas", label: "Arah Qiblat", icon: Compass },
              { id: "kas", label: "Kas Masjid", icon: DollarSign },
              { id: "agenda", label: "Agenda", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Mobile Tab Selector */}
        <div className="flex md:hidden overflow-x-auto space-x-2 pb-4 mb-4 scrollbar-none">
          {[
            { id: "jadwal", label: "Jadwal", icon: Clock },
            { id: "quran", label: "Qur'an", icon: BookOpen },
            { id: "kompas", label: "Qiblat", icon: Compass },
            { id: "kas", label: "Kas", icon: DollarSign },
            { id: "agenda", label: "Agenda", icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- TAB 1: JADWAL SHOLAT --- */}
        {activeTab === "jadwal" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Hari Ini
                </span>
                <h2 className="text-2xl font-bold text-white mt-3">Waktu Sholat & Ibadah</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Jadwal berdasarkan koordinat lokasi terkini ({locationName}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {jadwalSholat ? (
                Object.entries(jadwalSholat).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center group"
                  >
                    <span className="text-xs uppercase text-slate-400 group-hover:text-emerald-400 transition-colors">
                      {key}
                    </span>
                    <span className="text-xl font-bold text-white mt-1">{value}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-slate-500">
                  Memuat jadwal sholat...
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: AL-QUR'AN --- */}
        {activeTab === "quran" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar Daftar Surah */}
            <div className="md:col-span-4 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari Surah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-h-[600px] overflow-y-auto divide-y divide-slate-800/50">
                {filteredSurahList.map((surah) => (
                  <button
                    key={surah.nomor}
                    onClick={() => setSelectedSurahNo(surah.nomor)}
                    className={`w-full p-3.5 text-left flex items-center justify-between transition-colors ${
                      selectedSurahNo === surah.nomor
                        ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500"
                        : "hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-xs flex items-center justify-center text-slate-400 font-medium">
                        {surah.nomor}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{surah.namaLatin}</div>
                        <div className="text-xs text-slate-500">{surah.arti}</div>
                      </div>
                    </div>
                    <span className="text-right text-xs font-arabic text-slate-400">
                      {surah.nama}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Detail Surah */}
            <div className="md:col-span-8">
              {loadingQuran ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                  Memuat ayat-ayat Al-Qur'an...
                </div>
              ) : surahData ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="border-b border-slate-800 pb-4 text-center">
                    <h2 className="text-2xl font-bold text-white">{surahData.name.transliteration.id}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {surahData.name.translation.id} • {surahData.numberOfVerses} Ayat
                    </p>
                  </div>

                  <div className="space-y-6 divide-y divide-slate-800/60">
                    {surahData.verses?.map((ayah) => (
                      <div key={ayah.number.inSurah} className="pt-6 first:pt-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                            {ayah.number.inSurah}
                          </span>
                          <button
                            onClick={() => playAudio(ayah.audio?.primary)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            {playingAudio === ayah.audio?.primary ? (
                              <VolumeX className="w-4 h-4 text-emerald-400 animate-pulse" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-right text-2xl font-arabic leading-loose text-white pt-2">
                          {ayah.text.ar}
                        </div>
                        <div className="text-sm text-slate-400 leading-relaxed font-light">
                          {ayah.translation.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  Pilih surah untuk mulai membaca.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: KOMPAS QIBLAT --- */}
        {activeTab === "kompas" && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Kompas Arah Qiblat</h2>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan sensor orientasi perangkat Anda untuk menentukan arah Kiblat.
              </p>
            </div>

            <div className="relative w-48 h-48 mx-auto flex items-center justify-center border-4 border-slate-800 rounded-full bg-slate-950 shadow-inner">
              <div
                className="w-full h-full absolute flex items-center justify-center transition-transform duration-200"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                <div className="w-1 h-20 bg-emerald-500 rounded-full origin-bottom transform -translate-y-10" />
              </div>
              <div className="text-center z-10 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <span className="text-2xl font-bold text-white">{heading}°</span>
              </div>
            </div>

            <button
              onClick={startCompass}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              {kompasActive ? "Kompas Aktif" : "Aktifkan Kompas"}
            </button>
          </div>
        )}

        {/* --- TAB 4: KAS MASJID --- */}
        {activeTab === "kas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold">Total Pemasukan</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  Rp {kasSummary.pemasukan.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold">Total Pengeluaran</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  Rp {kasSummary.pengeluaran.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/20">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Saldo Akhir</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  Rp {kasSummary.saldo.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: AGENDA --- */}
        {activeTab === "agenda" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Agenda & Kegiatan Mendaag</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white leading-snug">{event.title}</h3>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                      {event.date}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    {event.time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
