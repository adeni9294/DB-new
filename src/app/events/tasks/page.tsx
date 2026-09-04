"use client";

import { useState, useEffect } from "react";

interface EventItem {
  id?: string;
  ID?: string;
  title?: string;
  TITLE?: string;
  startDate?: string;
  START_DATE?: string;
  endDate?: string;
  END_DATE?: string;
  location?: string;
  LOCATION?: string;
}

interface ToastNotification {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function AcaraPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const result = await res.json();
      
      if (result.success && Array.isArray(result.data)) {
        setEvents(result.data);
      } else {
        showToast(result.message || "Gagal memuat data dari database", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan saat memuat data", "error");
    } font-sans finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getValue = (item: EventItem, keyUpper: keyof EventItem, keyLower: keyof EventItem) => {
    return (item[keyLower] ?? item[keyUpper] ?? "") as string;
  };

  const formatForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: "", startDate: "", endDate: "", location: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EventItem) => {
    const id = getValue(item, "ID", "id");
    setEditingId(id);
    setFormData({
      title: getValue(item, "TITLE", "title"),
      startDate: formatForInput(getValue(item, "START_DATE", "startDate")),
      endDate: formatForInput(getValue(item, "END_DATE", "endDate")),
      location: getValue(item, "LOCATION", "location"),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        showToast(
          editingId ? "Acara berhasil diperbarui!" : "Acara baru berhasil ditambahkan!",
          "success"
        );
        fetchEvents();
      } else {
        showToast(result.message || "Gagal menyimpan acara", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem saat menghubungi database.", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/events?id=${deletingId}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Acara berhasil dihapus dari database", "info");
        fetchEvents();
      } else {
        showToast(result.message || "Gagal menghapus acara", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem saat menghapus data.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 relative font-sans">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                : toast.type === "error"
                ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
                : "bg-cyan-950/80 border-cyan-500/40 text-cyan-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white ml-3">✕</button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Manajemen Acara & Kegiatan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola jadwal, lokasi, dan aktivitas komunitas dalam satu dasbor.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Acara
        </button>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-[#0d1322]/80 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Memuat data...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Belum ada acara tersimpan di database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/40 text-slate-400 text-xs tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-4 font-medium">NAMA ACARA</th>
                  <th className="px-6 py-4 font-medium">WAKTU MULAI</th>
                  <th className="px-6 py-4 font-medium">WAKTU SELESAI</th>
                  <th className="px-6 py-4 font-medium">LOKASI</th>
                  <th className="px-6 py-4 font-medium text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {events.map((item, index) => {
                  const id = getValue(item, "ID", "id") || String(index);
                  const title = getValue(item, "TITLE", "title");
                  const startDate = getValue(item, "START_DATE", "startDate");
                  const endDate = getValue(item, "END_DATE", "endDate");
                  const location = getValue(item, "LOCATION", "location");

                  return (
                    <tr key={id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-normal text-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          {title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-light">
                        {formatDateDisplay(startDate)}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-light">
                        {formatDateDisplay(endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light bg-slate-800/60 border border-slate-700/50 text-slate-300">
                          <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Tombol Edit Icon Keuangan */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/60 rounded-lg transition"
                            title="Edit Acara"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {/* Tombol Hapus Icon Keuangan */}
                          <button
                            onClick={() => setDeletingId(id)}
                            className="p-2 bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700/60 rounded-lg transition"
                            title="Hapus Acara"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Edit / Create */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h2 className="text-lg font-semibold text-white mb-6">
              {editingId ? "Edit Acara" : "Tambah Acara Baru"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nama Acara
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Rapat Evaluasi"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Waktu Mulai
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Waktu Selesai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Lokasi
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Mushollah Ubaidillah"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Custom (Ganti confirm bawaan browser) */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Hapus Acara?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Apakah Anda yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-sm w-full"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition text-sm w-full"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
