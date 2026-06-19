import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { GoogleGenAI } from '@google/genai'

async function main() {
  console.log('Key prefix:', process.env.GOOGLE_AI_API_KEY?.slice(0, 8))
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! })
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Say hello in one word',
  })
  console.log('Response:', res.text)
}

main().catch(console.error)
