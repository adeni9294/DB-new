"use client";

import { useState, useEffect } from "react";

interface EventItem {
  ID: string;
  TITLE: string;
  START_DATE: string;
  END_DATE?: string;
  LOCATION: string;
}

export default function AcaraPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const result = await res.json();
      if (result.success) setEvents(result.data);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: "", startDate: "", endDate: "", location: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EventItem) => {
    setEditingId(item.ID);
    setFormData({
      title: item.TITLE,
      startDate: item.START_DATE ? item.START_DATE.substring(0, 16) : "",
      endDate: item.END_DATE ? item.END_DATE.substring(0, 16) : "",
      location: item.LOCATION,
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
        fetchEvents();
      } else {
        alert(result.message || "Gagal menyimpan acara");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan ke database.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus acara ini?")) return;

    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        fetchEvents();
      } else {
        alert(result.message || "Gagal menghapus acara");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghapus dari database.");
    }
  };

  return (
    <div className="p-6 text-white bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Acara / Kegiatan</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          + Tambah Acara Baru
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-4">Nama Acara</th>
              <th className="p-4">Mulai</th>
              <th className="p-4">Selesai</th>
              <th className="p-4">Lokasi</th>
              <th className="p-4 text-center">Aksi (Admin)</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-slate-500">
                  Belum ada acara di database.
                </td>
              </tr>
            ) : (
              events.map((item) => (
                <tr key={item.ID} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{item.TITLE}</td>
                  <td className="p-4">{item.START_DATE}</td>
                  <td className="p-4">{item.END_DATE || "-"}</td>
                  <td className="p-4">{item.LOCATION}</td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.ID)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm transition"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-5 text-white">
              {editingId ? "Edit Acara / Kegiatan" : "Buat Acara / Kegiatan Baru"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nama Acara / Kegiatan
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Rapat Anggota"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Waktu Selesai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Lokasi / Tempat
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Mushollah Ubaidillah"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition font-medium"
                >
                  {editingId ? "Perbarui" : "Simpan Acara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
