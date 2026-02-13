import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { verifyAuth } from './_lib/auth.js'
import { handleCors } from './_lib/cors.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await verifyAuth(req, res)
  if (!user) return

  const rl = checkRateLimit(user.id, 'whisper')
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rl.retryAfter })
  }

  try {
    // Parse multipart form data
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Find the audio data in the multipart form
    const boundary = req.headers['content-type']?.split('boundary=')[1]
    if (!boundary) {
      return res.status(400).json({ error: 'No boundary in content-type' })
    }

    // Simple multipart parsing to extract audio file
    const parts = buffer.toString('binary').split(`--${boundary}`)
    let audioData: Buffer | null = null

    for (const part of parts) {
      if (part.includes('name="audio"')) {
        // Find the start of binary data (after \r\n\r\n)
        const headerEnd = part.indexOf('\r\n\r\n')
        if (headerEnd !== -1) {
          const dataStart = headerEnd + 4
          const dataEnd = part.lastIndexOf('\r\n')
          const binaryStr = part.slice(dataStart, dataEnd > dataStart ? dataEnd : undefined)
          audioData = Buffer.from(binaryStr, 'binary')
        }
      }
    }

    if (!audioData || audioData.length === 0) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // Create a File object for OpenAI
    const audioFile = new File([audioData], 'audio.webm', { type: 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'fr',
    })

    return res.json({ text: transcription.text })
  } catch (error) {
    console.error('Whisper API error:', error)
    return res.status(500).json({ error: 'Transcription failed' })
  }
}
