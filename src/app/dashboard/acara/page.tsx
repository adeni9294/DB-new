'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, PlusCircle, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

type EventItem = {
  id: number
  title: string
  date: string
  time: string
  location: string
  status: 'Mendatang' | 'Berjalan' | 'Selesai'
}

export default function AcaraPage() {
  const searchParams = useSearchParams()
  const defaultAction = searchParams.get('action') // Menangkap parameter ?action=baru dari Dashboard

  // State Daftar Acara
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 1,
      title: 'Rapat Koordinasi Panitia',
      date: '2026-09-10',
      time: '10:00 - 11:30 WIB',
      location: 'Ruang Rapat Utama / Zoom',
      status: 'Mendatang',
    },
    {
      id: 2,
      title: 'Penutupan Donasi Kas Organisasi',
      date: '2026-09-17',
      time: '23:59 WIB',
      location: 'Online Platform',
      status: 'Mendatang',
    },
    {
      id: 3,
      title: 'Acara Seminar Kit & Workshop',
      date: '2026-08-25',
      time: '09:00 - 15:00 WIB',
      location: 'Auditorium Gedung B',
      status: 'Selesai',
    },
  ])

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')

  // Buka modal otomatis jika diakses via tombol Quick Action Dashboard
  useEffect(() => {
    if (defaultAction === 'baru') {
      setIsModalOpen(true)
    }
  }, [defaultAction])

  // Tambah Acara Baru
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return

    const newEvent: EventItem = {
      id: Date.now(),
      title,
      date,
      time: time || 'Seharian',
      location: location || 'Lokasi Belum Ditentukan',
      status: 'Mendatang',
    }

    setEvents([newEvent, ...events])
    setIsModalOpen(false)
    setTitle('')
    setDate('')
    setTime('')
    setLocation('')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Acara & Kegiatan</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola jadwal kegiatan, rapat, dan agenda organisasi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> + Acara Baru
        </button>
      </div>

      {/* DAFTAR ACARA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    item.status === 'Mendatang'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : item.status === 'Berjalan'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.status}
                </span>
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>

              <h3 className="text-base font-bold text-white pt-1">{item.title}</h3>

              <div className="space-y-1.5 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    {item.date} • {item.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH ACARA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Buat Acara / Kegiatan Baru</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Acara / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Pleno Kas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    placeholder="10:00 - 12:00"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Lokasi / Tempat</label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung A / Zoom Meeting"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Simpan Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
