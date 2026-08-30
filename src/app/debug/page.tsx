'use client'
import { useChat } from '@ai-sdk/react' // <-- PAKAI INI
import { useState } from 'react'

export default function DebugPage() {
  const [code, setCode] = useState('')
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/debug-agent',
    body: { code } // kirim code bareng chat
  })

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Debug Agent</h1>
      
      <textarea 
        placeholder="Paste kode error kamu disini"
        value={code} 
        onChange={e => setCode(e.target.value)}
        className="w-full h-40 border p-2 mb-2 rounded"
      />
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Jelasin error nya..." 
          className="flex-1 border p-2 rounded"
        />
        <button disabled={isLoading} className="bg-blue-500 text-white px-4 rounded">
          {isLoading ? 'Loading...' : 'Kirim'}
        </button>
      </form>
      
      <div className="mt-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className="p-2 bg-gray-100 rounded">
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>
    </div>
  )
}
