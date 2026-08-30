import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { z } from 'zod'

// JANGAN bikin const client lagi
// Langsung pake openai() di dalam streamText

export async function POST(req: Request) {
  const { messages, code } = await req.json()

  const result = await streamText({
    // INI CARA BARU BUAT CUSTOM BASEURL
    model: openai('gemini-1.5-flash-latest', {
      baseURL: process.env.OPENAI_BASE_URL, // contoh: https://openrouter.ai/api/v1
      apiKey: process.env.OPENAI_API_KEY,
    }),
    system: `Kamu adalah Senior Dev Next.js + TypeScript. Analisis error ini dan kasih solusi + kode fix nya. Jawab singkat dan to the point.`,
    messages: [
      ...messages,
      { role: 'user', content: `Ini kode saya:\n\`\n${code}\n\`\`` }
    ],
  })

  return result.toDataStreamResponse()
}
