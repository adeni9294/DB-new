'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react' // GANTI INI
import { UIMessage } from 'ai' // optional, buat type

export default function DebugPage() {
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')

  const { messages, isLoading, append } = useChat({
    api: '/api/debug-agent',
    body: { code }, // ini ke kirim tiap request
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    append({ role: 'user', content: input })
    setInput('')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Debug Agent</h1>
      
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste kode yg error disini..."
        className="w-full h-40 p-2 border rounded mb-4 font-mono"
      />

      <div className="border rounded p-4 h-96 overflow-y-auto mb-4">
        {messages.map(m => (
          <div key={m.id} className={`mb-2 ${m.role === 'user' ? 'text-right' : ''}`}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya tentang error..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-black text-white rounded">
          Kirim
        </button>
      </form>
    </div>
  )
}
