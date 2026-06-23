import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Fira Sans', Arial, sans-serif; background: #F9F7F2; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #0F1115; padding: 32px 40px; text-align: center; }
    .logo { color: #D4A017; font-size: 20px; font-weight: bold; letter-spacing: 2px; }
    .body { padding: 40px; }
    .title { font-size: 28px; color: #0F1115; margin-bottom: 16px; }
    .text { font-size: 15px; color: #8B7280; line-height: 1.6; }
    .btn { display: inline-block; background: #D4A017; color: #0F1115; padding: 14px 32px;
           border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
    .footer { background: #F9F7F2; padding: 24px 40px; text-align: center; font-size: 12px; color: #8B7280; }
    .amount { font-size: 36px; font-weight: bold; color: #D4A017; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><div class="logo">XCITY REAL ESTATE</div></div>
    <div class="body">${content}</div>
    <div class="footer">
      © 2025 XcityRealEstate.in · Belagavi, Karnataka<br>
      <a href="https://xcityrealestate.in">xcityrealestate.in</a>
    </div>
  </div>
</body>
</html>`
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xcityrealestate.in'

async function sendEmail(to: string, subject: string, html: string) {
  if (!to || !process.env.SMTP_USER) return
  await transporter.sendMail({
    from: `"XcityRealEstate.in" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailWrapper(html),
  })
}

export async function sendPaymentSuccessEmail({
  to,
  customerName,
  orderId,
  amount,
  planType,
  invoiceUrl,
}: {
  to: string
  customerName: string
  orderId: string
  amount: number
  planType: string | null | undefined
  invoiceUrl: string
}) {
  if (!to) return

  const content = `
    <h1 class="title">Payment Successful! 🎉</h1>
    <p class="text">Hi ${customerName || 'there'},</p>
    <p class="text">Your payment has been confirmed. Your access is now active.</p>
    <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
    <p class="text"><strong>Order ID:</strong> ${orderId}</p>
    <p class="text"><strong>Plan:</strong> ${planType || 'Single Property Access'}</p>
    <a href="${invoiceUrl}" class="btn">Download Invoice</a>
    <p class="text">Start exploring verified properties in Belagavi with zero brokerage.</p>
    <a href="${appUrl}/properties" class="btn" style="background:#0F1115;color:#D4A017;">
      Browse Properties
    </a>
  `

  await sendEmail(to, 'Payment Successful — XcityRealEstate.in', content)
}

export async function sendPropertyApprovedEmail({
  to,
  customerName,
  propertyTitle,
  propertySlug,
}: {
  to: string
  customerName: string
  propertyTitle: string
  propertySlug: string
}) {
  if (!to) return
  const content = `
    <h1 class="title">Property Approved ✅</h1>
    <p class="text">Hi ${customerName || 'there'},</p>
    <p class="text">Your property <strong>"${propertyTitle}"</strong> has been approved and is now live on XcityRealEstate.in.</p>
    <a href="${appUrl}/properties/${propertySlug}" class="btn">View Your Listing</a>
  `
  await sendEmail(to, 'Your property is now live — XcityRealEstate.in', content)
}

export async function sendPropertyRejectedEmail({
  to,
  customerName,
  propertyTitle,
  reason,
}: {
  to: string
  customerName: string
  propertyTitle: string
  reason: string
}) {
  if (!to) return
  const content = `
    <h1 class="title">Property Review Update</h1>
    <p class="text">Hi ${customerName || 'there'},</p>
    <p class="text">Your property <strong>"${propertyTitle}"</strong> could not be approved at this time.</p>
    <p class="text"><strong>Reason:</strong> ${reason}</p>
    <p class="text">Please update your listing and resubmit. Contact support if you have questions.</p>
    <a href="${appUrl}/dashboard/properties" class="btn">View My Properties</a>
  `
  await sendEmail(to, 'Property listing update — XcityRealEstate.in', content)
}

export async function sendSubscriptionExpiryWarning({
  to,
  customerName,
  expiryDate,
  planType,
}: {
  to: string
  customerName: string
  expiryDate: Date
  planType: string
}) {
  if (!to) return
  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000)
  const content = `
    <h1 class="title">Your subscription expires in ${daysLeft} days</h1>
    <p class="text">Hi ${customerName || 'there'},</p>
    <p class="text">Your <strong>${planType}</strong> plan expires on 
      <strong>${expiryDate.toLocaleDateString('en-IN')}</strong>.</p>
    <p class="text">Renew now to continue accessing owner contacts and property details without interruption.</p>
    <a href="${appUrl}/pricing" class="btn">Renew Plan</a>
  `
  await sendEmail(
    to,
    `Your XcityRealEstate.in subscription expires in ${daysLeft} days`,
    content
  )
}

export async function createInAppNotification({
  userId,
  title,
  body,
  link,
}: {
  userId: string
  title: string
  body: string
  link?: string
}) {
  return prisma.notification.create({
    data: { userId, title, body, link },
  })
}
