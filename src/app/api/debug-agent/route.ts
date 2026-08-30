import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { streamText } from 'ai'

const nineRouter = createOpenAICompatible({
  name: '9router',
  baseURL: process.env.OPENAI_BASE_URL ?? 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // INI CARANYA
    'HTTP-Referer': 'https://your-site.com', // wajib buat OpenRouter biar ke track
    'X-Title': 'Debug Agent'
  }
})

export async function POST(req: Request) {
  const { messages, code } = await req.json()

  const result = await streamText({
    model: nineRouter('google/gemini-3.5-flash'),
    system: `Kamu Senior Dev Next.js. Jawab error dan kasih fix kode. Bahasa Indonesia singkat.`,
    messages: [
      { role: 'user', content: `Ini kode yg error:\n\`\`tsx\n${code}\n\`\`\nJelaskan errornya` },
      ...messages
    ],
  })

  return result.toDataStreamResponse()
}
