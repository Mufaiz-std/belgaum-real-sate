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
  return data.secure_url
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
