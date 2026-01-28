import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
