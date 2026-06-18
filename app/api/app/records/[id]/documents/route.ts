import { NextRequest, NextResponse } from 'next/server'
import { getAppContext } from '@/lib/auth/app'
import { getFoiaDocuments, addFoiaDocument } from '@/lib/server/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getAppContext()
    const { id } = await params
    const documents = await getFoiaDocuments(id)
    return NextResponse.json({ documents })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getAppContext()
    const { id } = await params
    const body = await request.json()

    const { name, fileUrl, fileSize, mimeType, isRedacted } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 })
    }

    const uploadedBy = context.user?.name ?? 'Staff'

    const document = await addFoiaDocument(id, {
      name,
      fileUrl,
      fileSize,
      mimeType,
      uploadedBy,
      isRedacted,
    })

    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
