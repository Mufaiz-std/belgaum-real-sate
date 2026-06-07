'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { OTPAuthForm } from '@/components/auth/OTPAuthForm'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSuccess = () => {
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <OTPAuthForm
        mode="signup"
        title="Create Account"
        subtitle="Enter your details to get started"
        onSuccess={handleSuccess}
        footerLink={{
          text: 'Already have an account?',
          href: '/login',
          label: 'Sign in',
        }}
      />
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <Link href="/" className="text-sm text-neutral hover:text-dark">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream">
          <Loader2 className="size-8 animate-spin text-gold" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
