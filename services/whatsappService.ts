export async function sendWhatsAppMessage(to: string, message: string) {
  if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_PHONE_ID) return

  const phone = to.replace(/\D/g, '').replace(/^91/, '')

  const res = await fetch(
    `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `91${phone}`,
        type: 'text',
        text: { body: message },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    console.error('WhatsApp send failed:', err)
  }
}

export async function sendPaymentSuccessWhatsApp(
  phone: string,
  amount: number,
  planType: string | null
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://belgaumrealestate.in'
  const message = `✅ *Payment Confirmed — BelgaumRealEstate.in*\n\nAmount: ₹${amount.toLocaleString('en-IN')}\nPlan: ${planType || 'Single Property Access'}\n\nYou can now access owner contacts and property details.\n\n🏠 Browse: ${appUrl}/properties`
  await sendWhatsAppMessage(phone, message)
}

export async function sendPropertyApprovedWhatsApp(phone: string, propertyTitle: string) {
  const message = `✅ *Property Approved*\n\nYour listing "${propertyTitle}" is now live on BelgaumRealEstate.in.`
  await sendWhatsAppMessage(phone, message)
}

export async function sendPropertyRejectedWhatsApp(
  phone: string,
  propertyTitle: string,
  reason: string
) {
  const message = `❌ *Property Review Update*\n\n"${propertyTitle}" could not be approved.\nReason: ${reason}\n\nPlease update and resubmit via your dashboard.`
  await sendWhatsAppMessage(phone, message)
}
