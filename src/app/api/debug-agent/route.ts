import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'

const client = openai({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { error, code } = await req.json()

  const result = await streamText({
    model: client('gemini-1.5-flash-latest'), // otak nya pake Gemini via 9Router
    system: `Kamu adalah Senior Dev. Tugasmu: 1. Analisis error 2. Kasih solusi kode yg udah di fix 3. Jelasin kenapa error`,
    prompt: `Ini error nya: ${error}\n\nIni kode nya:\n${code}`,
    tools: {
      // Nanti bisa ditambahin tool buat baca file langsung
    }
  })

  return result.toDataStreamResponse()
}
