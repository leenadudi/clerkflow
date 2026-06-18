import type { ParseResult, DocType, ImportRecord } from './types'

const MODEL = 'gemini-2.0-flash'

const SYSTEM_PROMPT = `You are a data extraction assistant for a municipal clerk software system.
Given raw text from a document, identify the document type and extract structured records.

Document types:
- board_roster: Board/commission member rosters (names, boards, seats, term dates)
- meeting_list: Meeting schedules (titles, dates, times, locations, meeting types)
- foia_log: FOIA/public records request logs (requester info, request descriptions, statuses, deadlines)
- license_log: Permit/license logs (applicant info, license types, statuses, fees)
- unknown: Cannot determine document type

Return ONLY valid JSON matching this schema. No markdown, no explanation.`

const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    docType: { type: 'string', enum: ['board_roster', 'meeting_list', 'foia_log', 'license_log', 'unknown'] },
    reasoning: { type: 'string' },
    records: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          memberName: { type: 'string' },
          boardName: { type: 'string' },
          seat: { type: 'string' },
          expiresAt: { type: 'string' },
          title: { type: 'string' },
          startsAt: { type: 'string' },
          location: { type: 'string' },
          body: { type: 'string' },
          status: { type: 'string' },
          foiaId: { type: 'string' },
          requesterName: { type: 'string' },
          requesterEmail: { type: 'string' },
          summary: { type: 'string' },
          receivedAt: { type: 'string' },
          deadlineAt: { type: 'string' },
          foiaStatus: { type: 'string' },
          licenseType: { type: 'string' },
          applicantName: { type: 'string' },
          applicantEmail: { type: 'string' },
          applicantPhone: { type: 'string' },
          description: { type: 'string' },
          licenseStatus: { type: 'string' },
          submittedAt: { type: 'string' },
          fee: { type: 'string' },
        },
      },
    },
  },
  required: ['docType', 'records'],
}

export async function extractWithAI(rawText: string): Promise<ParseResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['AI extraction requires a GOOGLE_AI_API_KEY environment variable. Get one free at aistudio.google.com.'],
      rawText: rawText.slice(0, 3000),
      needsAI: true,
    }
  }

  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })

  const userPrompt = `Extract structured records from this document text:\n\n${rawText.slice(0, 12000)}`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: EXTRACTION_SCHEMA,
    },
  })

  const raw = response.text ?? ''
  let parsed: { docType: DocType; records: ImportRecord[] }

  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['AI returned an unexpected response format.'],
      rawText: rawText.slice(0, 3000),
      needsAI: false,
    }
  }

  const docType = parsed.docType ?? 'unknown'
  const records: ImportRecord[] = Array.isArray(parsed.records) ? parsed.records : []

  return {
    docType,
    confidence: records.length > 0 ? 0.85 : 0.4,
    records,
    warnings: records.length === 0 ? ['AI could not find structured records in this document.'] : [],
    rawText: rawText.slice(0, 3000),
    needsAI: false,
  }
}
