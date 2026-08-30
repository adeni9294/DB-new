'use client'

import { useState } from 'react'
import { useChat } from 'ai/react' // V4 pake ini

export default function DebugPage() {
  const [code, setCode] = useState('')

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ // V4 = isLoading
    api: '/api/debug-agent',
    body: { code }, // kirim code tiap request
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Debug Agent</h1>
      
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste kode yg error disini..."
        className="w-full h-40 p-2 border rounded mb-4 font-mono text-sm"
      />

      <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map(m => (
          <div key={m.id} className={`mb-3 ${m.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-2 rounded max-w-[80%] ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
              <b>{m.role}:</b> 
              <pre className="whitespace-pre-wrap text-sm">{m.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && <p className="text-gray-500">AI lagi mikir...</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          value={input}
          onChange={handleInputChange} // V4 = handleInputChange
          placeholder="Tanya tentang error..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-black text-white rounded disabled:bg-gray-400">
          {isLoading ? 'Kirim...' : 'Kirim'}
        </button>
      </form>
    </div>
  )
}
