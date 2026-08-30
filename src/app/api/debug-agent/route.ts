import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { streamText } from 'ai'

const nineRouter = createOpenAICompatible({
  name: '9router',
  baseURL: process.env.OPENAI_BASE_URL, // https://openrouter.ai/api/v1
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages, code } = await req.json()

  const result = await streamText({
    // GANTI KE 2.5-FLASH - GRATIS & CEPET
    model: nineRouter('google/gemini-2.5-flash'),
    
    system: `Kamu Senior Dev Next.js + TypeScript. Tugas: 1. Jelaskan penyebab error 2. Kasih kode fix lengkap 3. Jelaskan kenapa fix itu work. Jawab singkat, bahasa Indonesia.`,
    
    messages: [
      ...messages,
      { role: 'user', content: `Kode yg error:\n\`\`\`tsx\n${code}\n\`\`` }
    ],
  })

  return result.toDataStreamResponse()
}
