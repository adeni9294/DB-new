'use client'
import { useChat } from '@ai-sdk/react' // v4 pake ini
import { useState } from 'react'

export default function DebugPage() {
  const [code, setCode] = useState('')
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/debug-agent',
  })

  return (
    <div className="p-4">
      <h1>AI Debug Agent</h1>
      <textarea 
        value={code} 
        onChange={e => setCode(e.target.value)}
        className="w-full h-40 border p-2"
      />
      <form onSubmit={() => handleSubmit({ body: { code } })}>
        <input value={input} onChange={handleInputChange} placeholder="Jelasin error nya..." />
        <button disabled={isLoading}>Tanya Agent</button>
      </form>
      {messages.map(m => <div key={m.id}>{m.content}</div>)}
    </div>
  )
}
