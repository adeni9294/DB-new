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
    model: nineRouter('google/gemini-3.5-flash'), // ganti ke 'qwen/qwen-2.5-coder' kalau pake 9router lokal
    messages,
  })

  return result.toDataStreamResponse()
}
