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
    model: nineRouter('google/gemini-2.5-flash'),
    system: `Kamu Senior Dev Next.js. Jawab error dan kasih fix kode. Bahasa Indonesia singkat.`,
    messages: [
      ...messages.slice(0, -1),
      { role: 'user', content: `Kode: \n\`\`\`tsx\n${code}\n\`\`\`\nPertanyaan: ${messages[messages.length-1]?.content}` }
    ],
  })

  return result.toTextStreamResponse()
}
