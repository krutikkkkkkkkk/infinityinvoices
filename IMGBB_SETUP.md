# IMGBB Logo Upload Setup

This guide explains how to set up IMGBB API for company logo uploads in Infinity Invoice.

## Getting Your IMGBB API Key

1. Go to https://imgbb.com/
2. Click "Sign up" or "Sign in" with your account
3. Navigate to https://imgbb.com/api
4. Copy your API key from the page
5. Keep this key safe and never commit it to version control

## Setting Up the Environment Variable

Add your IMGBB API key to your Vercel project:

### Option 1: Via Vercel Dashboard
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_IMGBB_API_KEY`
   - **Value**: Your IMGBB API key
4. Redeploy your project

### Option 2: Via `.env.local` (Local Development)
Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_IMGBB_API_KEY=your_api_key_here
```

## How It Works

1. User selects a logo file in the Settings page
2. File is validated (image type, max 5MB)
3. File is uploaded to IMGBB via `/api/upload-logo`
4. IMGBB returns a permanent URL
5. URL is saved to the user's profile
6. Logo URL is stored in database and used on invoices

## Features

- **Drag & Drop Support**: Users can drag images onto the upload area
- **Preview**: Shows logo preview before saving
- **Easy Removal**: Click X to remove logo
- **File Validation**: Only accepts images up to 5MB
- **Error Handling**: Clear error messages if upload fails
- **Automatic Retry**: Failed uploads can be retried

## File Size Limits

- Maximum file size: 5MB
- Supported formats: PNG, JPG, GIF, WebP, and other image formats

## Troubleshooting

### "IMGBB API key not configured"
- Check that `NEXT_PUBLIC_IMGBB_API_KEY` is set in environment variables
- Redeploy after adding the environment variable

### "Failed to upload image to IMGBB"
- Check your IMGBB API key is correct
- Ensure the image file is valid
- Check IMGBB service status

### Image not showing on invoices
- Verify the logo URL is accessible
- Check that CORS is enabled on IMGBB (usually is by default)
- Try re-uploading the logo

## API Route

**Endpoint**: `POST /api/upload-logo`

**Request**:
- Multipart form data with `file` field containing the image

**Response** (Success):
```json
{
  "url": "https://i.imgbb.com/...",
  "deleteUrl": "https://api.imgbb.com/1/delete/..."
}
```

**Response** (Error):
```json
{
  "error": "Error message"
}
```

## Security Notes

- The API key is public (prefixed with `NEXT_PUBLIC_`) but that's safe for IMGBB
- Images are uploaded to IMGBB's CDN, not stored on your server
- Consider using IMGBB's deletion feature if users update their logo frequently
- IMGBB provides permanent URLs, so old logos can be referenced even after deletion
