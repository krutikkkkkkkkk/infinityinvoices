'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Upload, Loader2, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSubscription } from '@/hooks/use-subscription'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  onUploadComplete: (url: string) => void
}

export function LogoUpload({ currentLogoUrl, onUploadComplete }: LogoUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { plan, isLoading: isPlanLoading } = useSubscription()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setPreviewUrl(data.url)
      onUploadComplete(data.url)

      toast({
        title: 'Logo uploaded successfully',
        description: 'Your company logo has been updated',
      })
    } catch (error) {
      console.error('[v0] Logo upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUploadComplete('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Custom branding (a logo on documents) is a Pro feature; the upload route enforces this too
  if (!isPlanLoading && !plan.customBranding) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Company Logo</h3>
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
            Pro
          </span>
        </div>
        <div className="rounded-lg border border-dashed border-input p-5 text-center">
          <Lock className="w-6 h-6 mx-auto text-muted-foreground mb-2" aria-hidden />
          <p className="text-sm font-medium">Add your logo to invoices and quotations on Pro</p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentLogoUrl
              ? 'Your saved logo will show on documents again once you upgrade.'
              : 'Custom branding is included with the Pro plan.'}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/dashboard/plan">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Company Logo</h3>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB)</p>
        </div>
      </div>

      {previewUrl ? (
        <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border border-input">
          <Image
            src={previewUrl}
            alt="Company logo"
            fill
            className="object-contain p-2"
            priority
          />
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
            aria-label="Remove logo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-input rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click to upload logo</p>
          <p className="text-xs text-muted-foreground">or drag and drop</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="hidden"
        aria-hidden="true"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {previewUrl ? 'Change Logo' : 'Upload Logo'}
          </>
        )}
      </Button>
    </div>
  )
}
