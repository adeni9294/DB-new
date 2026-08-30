import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { streamText } from 'ai'

const nineRouter = createOpenAICompatible({
  name: '9router',
  baseURL: process.env.OPENAI_BASE_URL ?? 'https://openrouter.ai/api/v1',
  token: process.env.OPENAI_API_KEY ?? '', // GANTI INI DOANG
})

export async function POST(req: Request) {
  const { messages, code } = await req.json()

  const result = await streamText({
    model: nineRouter('google/gemini-3.5-flash'),
    system: `Kamu Senior Dev Next.js. Jawab error dan kasih fix kode. Bahasa Indonesia singkat.`,
    messages,
  })

  return result.toDataStreamResponse() // v4 pake ini
}
