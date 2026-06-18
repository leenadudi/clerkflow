import * as XLSX from 'xlsx'
import type { ParseResult } from './types'
import { detectDocTypeFromHeaders, mapRow } from './column-mapper'

export function extractXlsx(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { docType: 'unknown', confidence: 0, records: [], warnings: ['Empty workbook.'], needsAI: true }
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
    raw: false,
  })

  if (rows.length === 0) {
    return { docType: 'unknown', confidence: 0, records: [], warnings: ['No data rows found.'], needsAI: true }
  }

  const headers = Object.keys(rows[0])
  const { docType, confidence, fieldMap } = detectDocTypeFromHeaders(headers)

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

  return { docType, confidence, records, warnings: [], needsAI: confidence < 0.5 }
}
