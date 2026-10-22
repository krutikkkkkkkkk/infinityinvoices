import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanForUser } from '@/lib/plan-server'

const MAX_LOGO_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])

export async function POST(request: NextRequest) {
  try {
    // Only signed-in users may upload, so the IMGBB key can't be used as a free image host
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // A logo on documents (custom branding) is a Pro feature
    const plan = await getPlanForUser(user.id)
    if (!plan.customBranding) {
      return NextResponse.json(
        { error: 'Custom branding is a Pro feature. Upgrade to add your logo.' },
        { status: 403 }
      )
    }

    // IMGBB_API_KEY is preferred; the NEXT_PUBLIC_ name is kept as a fallback for existing deployments
    const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'IMGBB API key not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_LOGO_BYTES) {
      return NextResponse.json(
        { error: 'Logo must be a PNG, JPEG, GIF or WebP image under 5MB' },
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
