'use client'
import { useState } from 'react'
import { useChat } from 'ai/react'

export default function DebugPage() {
  const [code, setCode] = useState('')
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/debug-agent',
    body: { code } // kirim kode + error bareng
  })

  return (
    <div className="p-4">
      <h1>AI Debug Agent</h1>
      <textarea 
        placeholder="Paste kode error kamu disini"
        value={code} 
        onChange={e => setCode(e.target.value)}
        className="w-full h-40 border p-2"
      />
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="Jelasin error nya..." />
        <button disabled={isLoading}>Tanya Agent</button>
      </form>
      {messages.map(m => <div key={m.id}>{m.content}</div>)}
    </div>
  )
}
