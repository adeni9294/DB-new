'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // biar cookie bisa disimpen
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      // try parse json safely
      let data: any = null
      try {
        data = await res.json()
      } catch (err) {
        console.error('Failed to parse JSON from /api/auth/login', err)
        setError('Server response tidak valid')
        setLoading(false)
        return
      }

      if (res.ok) {
        // force full reload supaya middleware di server mengecek cookie baru
        window.location.href = '/dashboard'
      } else {
        setError((data && data.error) || 'Login gagal')
        setLoading(false)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Permintaan ke server timeout. Silakan coba lagi.')
      } else {
        console.error('Login request error:', err)
        setError('Gagal konek ke server')
      }
      setLoading(false)
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-gray-500 mt-2">Silakan login ke akun kamu</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              placeholder="nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Belum punya akun? 
          <Link href="/register" className="text-blue-600 font-semibold hover:underline ml-1">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
