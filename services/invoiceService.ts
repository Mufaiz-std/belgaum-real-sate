import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { uploadInvoiceToCloudinary } from '@/lib/cloudinary'

interface InvoiceParams {
  orderId: string
  amount: number
  paymentType: string
  planType?: string | null
  customerName: string
  customerPhone: string
  createdAt: Date
}

export async function generateInvoice(params: InvoiceParams): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const gold = rgb(0.831, 0.627, 0.09)
  const dark = rgb(0.059, 0.067, 0.082)

  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: dark })

  page.drawText('BELGAUM REAL ESTATE', {
    x: 40,
    y: height - 50,
    size: 20,
    font: boldFont,
    color: gold,
  })
  page.drawText('belgaumrealestate.in', {
    x: 40,
    y: height - 75,
    size: 12,
    font: regularFont,
    color: rgb(0.8, 0.8, 0.8),
  })

  page.drawText('TAX INVOICE', {
    x: width - 180,
    y: height - 50,
    size: 18,
    font: boldFont,
    color: gold,
  })

  const details: [string, string][] = [
    ['Invoice No:', params.orderId],
    ['Date:', params.createdAt.toLocaleDateString('en-IN')],
    [
      'Payment Type:',
      params.paymentType === 'SUBSCRIPTION'
        ? `${params.planType} Plan`
        : 'Single Property Access',
    ],
  ]

  let y = height - 160
  details.forEach(([label, value]) => {
    page.drawText(label, { x: 40, y, size: 11, font: boldFont, color: dark })
    page.drawText(value, { x: 200, y, size: 11, font: regularFont, color: dark })
    y -= 25
  })

  y -= 20
  page.drawText('Bill To:', { x: 40, y, size: 12, font: boldFont, color: dark })
  y -= 20
  page.drawText(params.customerName || 'Customer', {
    x: 40,
    y,
    size: 11,
    font: regularFont,
    color: dark,
  })
  y -= 18
  page.drawText(params.customerPhone, { x: 40, y, size: 11, font: regularFont, color: dark })

  y -= 40
  page.drawRectangle({ x: 40, y, width: width - 80, height: 30, color: dark })
  page.drawText('Description', {
    x: 55,
    y: y + 10,
    size: 11,
    font: boldFont,
    color: gold,
  })
  page.drawText('Amount', {
    x: width - 130,
    y: y + 10,
    size: 11,
    font: boldFont,
    color: gold,
  })

  y -= 30
  const description =
    params.paymentType === 'SUBSCRIPTION'
      ? `${params.planType} Subscription Plan`
      : 'Single Property Access (Lifetime)'
  page.drawText(description, {
    x: 55,
    y: y + 8,
    size: 11,
    font: regularFont,
    color: dark,
  })
  page.drawText(`Rs. ${params.amount.toLocaleString('en-IN')}`, {
    x: width - 130,
    y: y + 8,
    size: 11,
    font: regularFont,
    color: dark,
  })

  y -= 20
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })

  const gstAmount = Math.round((params.amount * 0.18) / 1.18)
  const baseAmount = params.amount - gstAmount

  y -= 20
  page.drawText('Subtotal (excl. GST):', {
    x: width - 250,
    y,
    size: 10,
    font: regularFont,
    color: dark,
  })
  page.drawText(`Rs. ${baseAmount.toLocaleString('en-IN')}`, {
    x: width - 110,
    y,
    size: 10,
    font: regularFont,
    color: dark,
  })

  y -= 18
  page.drawText('GST (18%):', {
    x: width - 250,
    y,
    size: 10,
    font: regularFont,
    color: dark,
  })
  page.drawText(`Rs. ${gstAmount.toLocaleString('en-IN')}`, {
    x: width - 110,
    y,
    size: 10,
    font: regularFont,
    color: dark,
  })

  y -= 18
  page.drawText('Total Amount:', {
    x: width - 250,
    y,
    size: 12,
    font: boldFont,
    color: dark,
  })
  page.drawText(`Rs. ${params.amount.toLocaleString('en-IN')}`, {
    x: width - 110,
    y,
    size: 12,
    font: boldFont,
    color: gold,
  })

  page.drawText(
    'Thank you for choosing BelgaumRealEstate.in — Zero Brokerage. Direct Owner Contact.',
    { x: 40, y: 60, size: 9, font: regularFont, color: rgb(0.5, 0.5, 0.5) }
  )
  page.drawText('For support: support@belgaumrealestate.in | Belagavi, Karnataka 590001', {
    x: 40,
    y: 42,
    size: 9,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  const pdfBytes = await pdfDoc.save()
  return uploadInvoiceToCloudinary(Buffer.from(pdfBytes), params.orderId)
}
