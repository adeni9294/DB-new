'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [full_name, setFullName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name })
    })

    const data = await res.json()
    if (res.ok) {
      alert('Registrasi berhasil! Silakan login')
      router.push('/login')
    } else {
      setError(data.error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Daftar</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input 
          type="text" 
          placeholder="Nama Lengkap" 
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required 
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Daftar
        </button>
        <p className="text-center mt-4">
          Sudah punya akun? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </form>
    </div>
  )
}
