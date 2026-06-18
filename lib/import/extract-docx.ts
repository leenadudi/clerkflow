import type { ParseResult } from './types'
import { detectDocTypeFromText, extractRecordsFromText } from './heuristics'

export async function extractDocx(buffer: Buffer): Promise<ParseResult> {
  let text = ''

  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    text = result.value ?? ''
  } catch {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['Could not read this Word document.'],
      rawText: '',
      needsAI: true,
    }
  }

  if (!text.trim()) {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['Document appears to be empty.'],
      rawText: '',
      needsAI: true,
    }
  }

  const { docType, confidence } = detectDocTypeFromText(text)

  if (docType === 'unknown') {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['Could not identify document type from content.'],
      rawText: text.slice(0, 3000),
      needsAI: true,
    }
  }

  const records = extractRecordsFromText(text, docType)
  const warnings: string[] = []

  if (records.length === 0) {
    warnings.push('Document type detected but no structured records could be extracted.')
  }

  return {
    docType,
    confidence: records.length > 0 ? confidence : confidence * 0.3,
    records,
    warnings,
    rawText: text.slice(0, 3000),
    needsAI: confidence < 0.5 || records.length === 0,
  }
}
