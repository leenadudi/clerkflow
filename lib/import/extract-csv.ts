import Papa from 'papaparse'
import type { ParseResult } from './types'
import { detectDocTypeFromHeaders, mapRow } from './column-mapper'

export function extractCsv(text: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const headers = parsed.meta.fields ?? []
  const rows = parsed.data

  if (headers.length === 0 || rows.length === 0) {
    return { docType: 'unknown', confidence: 0, records: [], warnings: ['No data found in file.'], needsAI: true }
  }

  const { docType, confidence, fieldMap } = detectDocTypeFromHeaders(headers)
  const warnings: string[] = []

  if (parsed.errors.length > 0) {
    warnings.push(`${parsed.errors.length} row(s) had parse errors and were skipped.`)
  }

  if (docType === 'unknown') {
    return {
      docType: 'unknown',
      confidence: 0,
      records: [],
      warnings: [`Could not identify document type. Headers found: ${headers.join(', ')}`],
      needsAI: true,
    }
  }

  const records = rows
    .map((row) => mapRow(row, fieldMap, docType))
    .filter((r) => Object.values(r).some((v) => v))

  return {
    docType,
    confidence,
    records,
    warnings,
    needsAI: confidence < 0.5,
  }
}
