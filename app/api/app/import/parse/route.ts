import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { extractCsv } from '@/lib/import/extract-csv'
import { extractXlsx } from '@/lib/import/extract-xlsx'
import { extractPdf } from '@/lib/import/extract-pdf'
import { extractDocx } from '@/lib/import/extract-docx'
import { extractWithAI } from '@/lib/import/extract-ai'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  try {
    if (name.endsWith('.csv')) {
      const text = buffer.toString('utf-8')
      return NextResponse.json(extractCsv(text))
    }

    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return NextResponse.json(extractXlsx(buffer))
    }

    if (name.endsWith('.pdf')) {
      const result = await extractPdf(buffer)
      if (result.needsAI && result.rawText) {
        return NextResponse.json(await extractWithAI(result.rawText))
      }
      return NextResponse.json(result)
    }

    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      const result = await extractDocx(buffer)
      if (result.needsAI && result.rawText) {
        return NextResponse.json(await extractWithAI(result.rawText))
      }
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Unsupported file type. Supported: CSV, XLSX, PDF, DOCX' },
      { status: 415 },
    )
  } catch (err) {
    console.error('Import parse error:', err)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 })
  }
}
