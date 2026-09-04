'use client'

import React, { useState, useEffect } from 'react'
import { User, Lock, Bell, Save, KeyRound, ShieldCheck, Loader2 } from 'lucide-react'

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<'profil' | 'keamanan' | 'notifikasi'>('profil')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Administrator')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailNotify, setEmailNotify] = useState(true)
  const [budgetAlert, setBudgetAlert] = useState(true)

  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 1. Fetch Data User dari Oracle
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/user/profile')
        const data = await res.json()

        if (res.ok) {
          setFullName(data.name || '')
          setEmail(data.email || '')
          setRole(data.role || 'Administrator')
        } else {
          setMessage(data.message || 'Gagal memuat profil.')
          setIsError(true)
        }
      } catch (err) {
        console.error('Gagal mengambil data profil:', err)
        setMessage('Terjadi kesalahan koneksi saat mengambil data.')
        setIsError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const showNotification = (msg: string, error = false) => {
    setMessage(msg)
    setIsError(error)
    setTimeout(() => setMessage(''), 4000)
  }

  // 2. Update Profil ke Oracle DB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email })
      })

      const data = await res.json()

      if (res.ok) {
        showNotification(data.message || 'Profil berhasil diperbarui ke Oracle Database!')
      } else {
        showNotification(data.message || 'Gagal memperbarui profil.', true)
      }
    } catch (err) {
      showNotification('Terjadi kesalahan koneksi.', true)
    } finally {
      setIsSaving(false)
    }
  }

  // 3. Update Password ke Oracle DB
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showNotification('Konfirmasi kata sandi tidak cocok!', true)
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        showNotification(data.message || 'Kata sandi berhasil diubah!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showNotification(data.message || 'Gagal mengubah kata sandi.', true)
      }
    } catch (err) {
      showNotification('Terjadi kesalahan koneksi.', true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-100">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-slate-400 mt-1">
          Kelola profil pengguna, preferensi akun, dan keamanan sistem.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 border rounded-xl text-xs font-medium transition-all ${
            isError
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profil'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <User className="w-4 h-4" /> Profil Akun
          </button>

          <button
            onClick={() => setActiveTab('keamanan')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'keamanan'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Lock className="w-4 h-4" /> Keamanan & Sandi
          </button>

          <button
            onClick={() => setActiveTab('notifikasi')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notifikasi'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifikasi
          </button>
        </div>

        <div className="md:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Memuat data...
            </div>
          ) : (
            <>
              {activeTab === 'profil' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" /> Informasi Profil
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Peran / Role</label>
                      <input
                        type="text"
                        disabled
                        value={role}
                        className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'keamanan' && (
                <form onSubmit={handleSaveSecurity} className="space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" /> Ubah Kata Sandi
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Kata Sandi Saat Ini</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Kata Sandi Baru</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Konfirmasi Kata Sandi Baru</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" /> Perbarui Kata Sandi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notifikasi' && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" /> Preferensi Notifikasi
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Notifikasi Email</p>
                        <p className="text-[11px] text-slate-400">Terima laporan mingguan arus kas via email.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailNotify}
                        onChange={(e) => setEmailNotify(e.target.checked)}
                        className="w-4 h-4 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Peringatan Budget Overlimit</p>
                        <p className="text-[11px] text-slate-400">Pemberitahuan jika budget kategori melebihi 100%.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={budgetAlert}
                        onChange={(e) => setBudgetAlert(e.target.checked)}
                        className="w-4 h-4 accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
