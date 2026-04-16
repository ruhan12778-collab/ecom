import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Unsupported file type. Use JPG, PNG, or WEBP.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const ext = (path.extname(file.name) || '.jpg').toLowerCase()
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads', 'courses')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ success: true, url: `/uploads/courses/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
