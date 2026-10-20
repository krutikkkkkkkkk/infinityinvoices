import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'IMGBB API key not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Upload to IMGBB
    const imgbbFormData = new FormData()
    imgbbFormData.append('image', base64)
    imgbbFormData.append('key', apiKey)

    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    })

    const imgbbData = await imgbbResponse.json()

    if (!imgbbData.success) {
      console.error('[v0] IMGBB error:', imgbbData.error)
      return NextResponse.json(
        { error: 'Failed to upload image to IMGBB' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      url: imgbbData.data.url,
      deleteUrl: imgbbData.data.delete_url,
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
