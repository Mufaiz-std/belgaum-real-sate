/**
 * Uploads a (pre-optimized) image File to Cloudinary.
 * The caller is responsible for optimizing the file before calling this.
 * Returns the secure_url with f_auto,q_auto,w_1280 transformations applied.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', 'belgaum-real-estate/properties')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed')

  // Inject delivery transformations into the URL
  return buildCloudinaryUrl(data.secure_url)
}

/**
 * Transforms a raw Cloudinary secure_url to use optimized delivery parameters:
 * f_auto (best format for browser), q_auto (auto quality), w_1280 (max width).
 *
 * Input:  https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.jpg
 * Output: https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_1280/v123/folder/file.jpg
 */
export function buildCloudinaryUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl
  // Already has transformations — don't double-insert
  if (rawUrl.includes('/f_auto,')) return rawUrl
  return rawUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1280/')
}

export async function uploadInvoiceToCloudinary(
  buffer: Buffer,
  orderId: string
): Promise<string> {
  const base64 = buffer.toString('base64')
  const formData = new FormData()
  formData.append('file', `data:application/pdf;base64,${base64}`)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', 'belgaum-real-estate/invoices')
  formData.append('public_id', orderId)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Invoice upload failed')
  return data.secure_url
}
