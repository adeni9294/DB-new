import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { streamText } from 'ai'

const nineRouter = createOpenAICompatible({
  name: '9router',
  baseURL: process.env.OPENAI_BASE_URL ?? 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY ?? '',
})

export async function POST(req: Request) {
  const { messages, code } = await req.json()

  const result = await streamText({
    model: nineRouter('google/gemini-3.5-flash'),
    system: `Kamu Senior Dev Next.js + TypeScript. Jelaskan penyebab error dan kasih kode fix. Bahasa Indonesia.`,
    messages: [
      ...messages,
      { role: 'user', content: `Kode yg error:\n\`\`tsx\n${code}\n\`\`` }
    ],
  })

  return result.toTextStreamResponse() // INI YANG DIGANTI
}
