'use client'

import { useState } from 'react'
import { PublicPageShell } from '@/components/layout/PublicPageShell'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          message: data.get('message'),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Message sent! We will get back to you soon.')
      form.reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicPageShell
      title="Contact Us"
      subtitle="We are here to help with listings, subscriptions, and support"
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 size-5 shrink-0 text-gold" />
            <div>
              <p className="font-semibold text-dark">Address</p>
              <p className="text-sm text-neutral">
                Tilakwadi, Belagavi, Karnataka 590006, India
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="mt-1 size-5 shrink-0 text-gold" />
            <div>
              <p className="font-semibold text-dark">Phone</p>
              <p className="text-sm text-neutral">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Mail className="mt-1 size-5 shrink-0 text-gold" />
            <div>
              <p className="font-semibold text-dark">Email</p>
              <p className="text-sm text-neutral">hello@xcityrealestate.in</p>
            </div>
          </div>
          <p className="text-sm text-neutral">
            Business hours: Monday – Sunday, 9 AM – 8 PM IST
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
              Name
            </label>
            <Input name="name" required placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
              Phone
            </label>
            <Input name="phone" required placeholder="10-digit mobile" maxLength={10} />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
              Message
            </label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="How can we help?"
              className="w-full rounded-lg border border-neutral/30 px-4 py-3 font-body text-dark outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gold text-dark">
            <Send className="mr-2 size-4" />
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </PublicPageShell>
  )
}
