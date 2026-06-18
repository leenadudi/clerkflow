import type { ParseResult } from './types'
import { detectDocTypeFromText, extractRecordsFromText } from './heuristics'

export async function extractPdf(buffer: Buffer): Promise<ParseResult> {
  let text = ''

  try {
    // pdf-parse is CJS; dynamic import avoids its test-file path quirk
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
    const result = await pdfParse(buffer)
    text = result.text ?? ''
  } catch {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['Could not extract text from this PDF. It may be a scanned image — AI extraction required.'],
      rawText: '',
      needsAI: true,
    }
  }

  if (!text.trim()) {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: ['PDF contains no extractable text (likely scanned). AI extraction required.'],
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
    warnings.push('Document type detected but no structured records could be extracted. Try AI extraction for better results.')
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
