'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateProfile } from '@/actions/user'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})

const NOTIF_KEY = 'notification-prefs'

interface SettingsFormProps {
  phone: string
  initialData: {
    name: string | null
    email: string | null
  }
}

export function SettingsForm({ phone, initialData }: SettingsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData.name || '')
  const [email, setEmail] = useState(initialData.email || '')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(NOTIF_KEY)
    if (stored) {
      try {
        const prefs = JSON.parse(stored)
        setEmailNotifications(prefs.email ?? true)
        setWhatsappNotifications(prefs.whatsapp ?? true)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const saveNotificationPrefs = (email: boolean, whatsapp: boolean) => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify({ email, whatsapp }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = profileSchema.safeParse({
      name: name || undefined,
      email: email || '',
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      await updateProfile(result.data)
      saveNotificationPrefs(emailNotifications, whatsappNotifications)
      toast.success('Profile updated')
      router.refresh()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await apiFetch('/api/users/delete', { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Account deleted')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="rounded-xl bg-white p-6 shadow-sm space-y-6">
        <h2 className="font-headline text-xl text-dark">Profile</h2>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com (optional)"
          />
          {errors.email && <p className="text-sm text-error">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} disabled className="bg-cream text-neutral" />
        </div>

        <div className="border-t border-cream-dark pt-6">
          <h2 className="mb-4 font-headline text-xl text-dark">Notifications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body font-medium text-dark">Email notifications</p>
                <p className="text-sm text-neutral">Receive updates via email</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-body font-medium text-dark">WhatsApp notifications</p>
                <p className="text-sm text-neutral">Receive updates via WhatsApp</p>
              </div>
              <Switch
                checked={whatsappNotifications}
                onCheckedChange={setWhatsappNotifications}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-gold text-dark hover:bg-gold-light"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>

      <div className="rounded-xl border border-error/30 bg-white p-6 shadow-sm">
        <h2 className="font-headline text-xl text-error">Danger Zone</h2>
        <p className="mt-2 font-body text-sm text-neutral">
          Permanently delete your account and all associated data.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4 border-error text-error hover:bg-error/10">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All your properties and data will be permanently
                removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
