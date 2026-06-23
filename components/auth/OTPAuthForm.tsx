// 'use client'

// import { useRef, useState } from 'react'
// import Link from 'next/link'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Home, Loader2 } from 'lucide-react'
// import { useOTPAuth } from '@/hooks/useAuth'
// import { Button } from '@/components/ui/button'
// import { toast } from 'sonner'

// interface OTPAuthFormProps {
//   mode: 'login' | 'signup'
//   title: string
//   subtitle: string
//   onSuccess: (role: string) => void
//   footerLink?: { href: string; label: string; text: string }
// }

// export function OTPAuthForm({
//   mode,
//   title,
//   subtitle,
//   onSuccess,
//   footerLink,
// }: OTPAuthFormProps) {
//   const otpRefs = useRef<(HTMLInputElement | null)[]>([])
//   const [shake, setShake] = useState(false)

//   const {
//     step,
//     setStep,
//     phone,
//     setPhone,
//     name,
//     setName,
//     otp,
//     setOtp,
//     proceedFromPhone,
//     proceedFromName,
//     verifyOTP,
//     resendOTP,
//     loading,
//     error,
//     countdown,
//     setError,
//   } = useOTPAuth({ mode })

//   const maskedPhone =
//     phone.length >= 4
//       ? `+91 ${'X'.repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`
//       : `+91 ${phone}`

//   const handlePhoneSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       await proceedFromPhone()
//     } catch {
//       toast.error('Failed to continue. Please try again.')
//     }
//   }

//   const handleNameSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       await proceedFromName()
//     } catch {
//       toast.error('Failed to send OTP. Please try again.')
//     }
//   }

//   const handleOtpChange = (index: number, value: string) => {
//     if (!/^\d*$/.test(value)) return
//     const newOtp = [...otp]
//     newOtp[index] = value.slice(-1)
//     setOtp(newOtp)
//     setError(null)
//     if (value && index < 5) otpRefs.current[index + 1]?.focus()
//   }

//   const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       otpRefs.current[index - 1]?.focus()
//     }
//   }

//   const handleOtpPaste = (e: React.ClipboardEvent) => {
//     e.preventDefault()
//     const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
//     if (!pasted) return
//     const newOtp = [...otp]
//     for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || ''
//     setOtp(newOtp)
//     otpRefs.current[Math.min(pasted.length, 5)]?.focus()
//   }

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (otp.some((d) => !d)) return
//     try {
//       const role = await verifyOTP()
//       if (role) onSuccess(role)
//     } catch {
//       setShake(true)
//       setTimeout(() => setShake(false), 500)
//     }
//   }

//   return (
//     <div className="w-full max-w-md">
//       <div className="rounded-2xl bg-white p-10 shadow-xl">
//         <div className="mb-8 flex flex-col items-center gap-2">
//           <Home className="size-10 text-gold" />
//           <div className="text-center font-mono text-xs text-dark">
//             <span className="block font-bold text-gold">XCITY</span>
//             <span className="block">REAL ESTATE</span>
//           </div>
//         </div>

//         <div id="recaptcha-container" />

//         <AnimatePresence mode="wait">
//           {step === 'phone' && (
//             <motion.form
//               key="phone"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               onSubmit={handlePhoneSubmit}
//               className="space-y-6"
//             >
//               <div className="text-center">
//                 <h1 className="font-headline text-[28px] text-dark">{title}</h1>
//                 <p className="mt-2 font-body text-neutral">{subtitle}</p>
//               </div>

//               <div>
//                 <div className="flex overflow-hidden rounded-lg border border-neutral/30 focus-within:border-l-4 focus-within:border-l-gold focus-within:border-neutral/30">
//                   <span className="flex items-center bg-cream px-4 font-mono text-sm text-neutral">
//                     +91
//                   </span>
//                   <input
//                     type="tel"
//                     inputMode="numeric"
//                     maxLength={10}
//                     value={phone}
//                     onChange={(e) =>
//                       setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
//                     }
//                     placeholder="9876543210"
//                     className="flex-1 border-0 bg-white px-4 py-3.5 font-mono text-dark outline-none placeholder:text-neutral/50"
//                   />
//                 </div>
//                 {error && <p className="mt-2 text-sm text-error">{error}</p>}
//               </div>

//               <Button
//                 type="submit"
//                 disabled={loading || phone.length !== 10}
//                 className="h-12 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
//               >
//                 {loading ? (
//                   <Loader2 className="size-5 animate-spin" />
//                 ) : mode === 'signup' ? (
//                   'Continue'
//                 ) : (
//                   'Send OTP'
//                 )}
//               </Button>

//               <p className="text-center text-xs text-neutral">
//                 By continuing, you agree to our{' '}
//                 <Link href="/terms" className="text-gold hover:underline">
//                   Terms of Service
//                 </Link>
//               </p>
//             </motion.form>
//           )}

//           {step === 'name' && (
//             <motion.form
//               key="name"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               onSubmit={handleNameSubmit}
//               className="space-y-6"
//             >
//               <div className="text-center">
//                 <h1 className="font-headline text-[28px] text-dark">
//                   {mode === 'signup' ? title : 'Create your account'}
//                 </h1>
//                 <p className="mt-2 font-body text-neutral">
//                   {mode === 'signup'
//                     ? subtitle
//                     : 'New number detected. Enter your name to continue.'}
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Your full name"
//                     className="w-full rounded-lg border border-neutral/30 px-4 py-3.5 font-body text-dark outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
//                     Phone
//                   </label>
//                   {mode === 'signup' ? (
//                     <div className="flex overflow-hidden rounded-lg border border-neutral/30 focus-within:border-l-4 focus-within:border-l-gold">
//                       <span className="flex items-center bg-cream px-4 font-mono text-sm text-neutral">
//                         +91
//                       </span>
//                       <input
//                         type="tel"
//                         inputMode="numeric"
//                         maxLength={10}
//                         value={phone}
//                         onChange={(e) =>
//                           setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
//                         }
//                         placeholder="9876543210"
//                         className="flex-1 border-0 bg-white px-4 py-3.5 font-mono text-dark outline-none"
//                       />
//                     </div>
//                   ) : (
//                     <div className="rounded-lg border border-neutral/20 bg-cream px-4 py-3.5 font-mono text-dark">
//                       +91 {phone}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {error && <p className="text-sm text-error">{error}</p>}

//               <Button
//                 type="submit"
//                 disabled={
//                   loading ||
//                   name.trim().length < 2 ||
//                   (mode === 'signup' && phone.length !== 10)
//                 }
//                 className="h-12 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
//               >
//                 {loading ? <Loader2 className="size-5 animate-spin" /> : 'Send OTP'}
//               </Button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setStep('phone')
//                   setError(null)
//                 }}
//                 className="w-full text-sm text-neutral hover:text-dark"
//               >
//                 Change phone number
//               </button>
//             </motion.form>
//           )}

//           {step === 'otp' && (
//             <motion.form
//               key="otp"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               onSubmit={handleVerify}
//               className="space-y-6"
//             >
//               <div className="text-center">
//                 <h1 className="font-headline text-[28px] text-dark">Verify your number</h1>
//                 <p className="mt-2 font-body text-neutral">OTP sent to {maskedPhone}</p>
//               </div>

//               <motion.div
//                 animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
//                 className="flex justify-center gap-2"
//                 onPaste={handleOtpPaste}
//               >
//                 {otp.map((digit, index) => (
//                   <input
//                     key={index}
//                     ref={(el) => {
//                       otpRefs.current[index] = el
//                     }}
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={1}
//                     value={digit}
//                     onChange={(e) => handleOtpChange(index, e.target.value)}
//                     onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                     className={`size-12 rounded-lg border text-center font-mono text-xl outline-none transition-colors sm:h-12 sm:w-12 ${
//                       error
//                         ? 'border-error focus:ring-2 focus:ring-error/20'
//                         : 'border-neutral/30 focus:border-gold focus:ring-2 focus:ring-gold/20'
//                     }`}
//                   />
//                 ))}
//               </motion.div>

//               {error && <p className="text-center text-sm text-error">{error}</p>}

//               <Button
//                 type="submit"
//                 disabled={loading || otp.some((d) => !d)}
//                 className="h-12 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
//               >
//                 {loading ? (
//                   <Loader2 className="size-5 animate-spin" />
//                 ) : mode === 'signup' ? (
//                   'Create Account'
//                 ) : (
//                   'Verify & Continue'
//                 )}
//               </Button>

//               <div className="text-center">
//                 {countdown > 0 ? (
//                   <p className="font-mono text-sm text-neutral">
//                     Resend OTP in 0:{countdown.toString().padStart(2, '0')}
//                   </p>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => resendOTP().catch(() => toast.error('Failed to resend OTP'))}
//                     className="font-mono text-sm text-gold hover:underline"
//                   >
//                     Resend OTP
//                   </button>
//                 )}
//               </div>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setStep(mode === 'signup' ? 'name' : 'phone')
//                   setOtp(['', '', '', '', '', ''])
//                   setError(null)
//                 }}
//                 className="w-full text-sm text-neutral hover:text-dark"
//               >
//                 {mode === 'signup' ? 'Change details' : 'Change phone number'}
//               </button>
//             </motion.form>
//           )}
//         </AnimatePresence>

//         {footerLink && (
//           <p className="mt-6 text-center text-sm text-neutral">
//             {footerLink.text}{' '}
//             <Link href={footerLink.href} className="text-gold hover:underline">
//               {footerLink.label}
//             </Link>
//           </p>
//         )}
//       </div>
//     </div>
//   )
// }


'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Loader2 } from 'lucide-react'
import { useOTPAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface OTPAuthFormProps {
  mode: 'login' | 'signup'
  title: string
  subtitle: string
  onSuccess: (role: string) => void
  footerLink?: { href: string; label: string; text: string }
}

export function OTPAuthForm({
  mode,
  title,
  subtitle,
  onSuccess,
  footerLink,
}: OTPAuthFormProps) {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [shake, setShake] = useState(false)

  const {
    step,
    setStep,
    phone,
    setPhone,
    name,
    setName,
    otp,
    setOtp,
    proceedFromPhone,
    proceedFromName,
    verifyOTP,
    resendOTP,
    loading,
    error,
    countdown,
    setError,
  } = useOTPAuth({ mode })

  const maskedPhone =
    phone.length >= 4
      ? `+91 ${'X'.repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`
      : `+91 ${phone}`

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await proceedFromPhone()
    } catch {
      toast.error('Failed to continue. Please try again.')
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await proceedFromName()
    } catch {
      toast.error('Failed to send OTP. Please try again.')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError(null)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || ''
    setOtp(newOtp)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.some((d) => !d)) return
    try {
      const role = await verifyOTP()
      if (role) onSuccess(role)
    } catch {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Home className="size-10 text-gold" />
          <div className="text-center font-mono text-xs text-dark">
            <span className="block font-bold text-gold">XCITY</span>
            <span className="block">REAL ESTATE</span>
          </div>
        </div>

        {/* CHANGED: Removed the hardcoded recaptcha-container element anchor */}

        <AnimatePresence mode="wait">
          {step === 'phone' && (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handlePhoneSubmit}
              className="space-y-6"
            >
              <div className="text-center">
                <h1 className="font-headline text-[28px] text-dark">{title}</h1>
                <p className="mt-2 font-body text-neutral">{subtitle}</p>
              </div>

              <div>
                <div className="flex overflow-hidden rounded-lg border border-neutral/30 focus-within:border-l-4 focus-within:border-l-gold focus-within:border-neutral/30">
                  <span className="flex items-center bg-cream px-4 font-mono text-sm text-neutral">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="9876543210"
                    className="flex-1 border-0 bg-white px-4 py-3.5 font-mono text-dark outline-none placeholder:text-neutral/50"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-error">{error}</p>}
              </div>

              {/* CHANGED: Added unique submit id string pattern */}
              <Button
                id="submit-phone-btn"
                type="submit"
                disabled={loading || phone.length !== 10}
                className="h-12 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : mode === 'signup' ? (
                  'Continue'
                ) : (
                  'Send OTP'
                )}
              </Button>

              <p className="text-center text-xs text-neutral">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-gold hover:underline">
                  Terms of Service
                </Link>
              </p>
            </motion.form>
          )}

          {step === 'name' && (
            <motion.form
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleNameSubmit}
              className="space-y-6"
            >
              <div className="text-center">
                <h1 className="font-headline text-[28px] text-dark">
                  {mode === 'signup' ? title : 'Create your account'}
                </h1>
                <p className="mt-2 font-body text-neutral">
                  {mode === 'signup'
                    ? subtitle
                    : 'New number detected. Enter your name to continue.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-neutral/30 px-4 py-3.5 font-body text-dark outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs uppercase text-neutral">
                    Phone
                  </label>
                  {mode === 'signup' ? (
                    <div className="flex overflow-hidden rounded-lg border border-neutral/30 focus-within:border-l-4 focus-within:border-l-gold">
                      <span className="flex items-center bg-cream px-4 font-mono text-sm text-neutral">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        placeholder="9876543210"
                        className="flex-1 border-0 bg-white px-4 py-3.5 font-mono text-dark outline-none"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-neutral/20 bg-cream px-4 py-3.5 font-mono text-dark">
                      +91 {phone}
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              {/* CHANGED: Added unique name submit id string pattern */}
              <Button
                id="submit-name-btn"
                type="submit"
                disabled={
                  loading ||
                  name.trim().length < 2 ||
                  (mode === 'signup' && phone.length !== 10)
                }
                className="h-12 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : 'Send OTP'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setError(null)
                }}
                className="w-full text-sm text-neutral hover:text-dark"
              >
                Change phone number
              </button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerify}
              className="space-y-6"
            >
              <div className="text-center">
                <h1 className="font-headline text-[28px] text-dark">Verify your number</h1>
                <p className="mt-2 font-body text-neutral">OTP sent to {maskedPhone}</p>
              </div>

              <motion.div
                animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                className="flex justify-center gap-2"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`size-12 rounded-lg border text-center font-mono text-xl outline-none transition-colors sm:h-12 sm:w-12 ${error
                        ? 'border-error focus:ring-2 focus:ring-error/20'
                        : 'border-neutral/30 focus:border-gold focus:ring-2 focus:ring-gold/20'
                      }`}
                  />
                ))}
              </motion.div>

              {error && <p className="text-center text-sm text-error">{error}</p>}

              <Button
                type="submit"
                disabled={loading || otp.some((d) => !d)}
                className="h-12 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : mode === 'signup' ? (
                  'Create Account'
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="font-mono text-sm text-neutral">
                    Resend OTP in 0:{countdown.toString().padStart(2, '0')}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => resendOTP().catch(() => toast.error('Failed to resend OTP'))}
                    className="font-mono text-sm text-gold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(mode === 'signup' ? 'name' : 'phone')
                  setOtp(['', '', '', '', '', ''])
                  setError(null)
                }}
                className="w-full text-sm text-neutral hover:text-dark"
              >
                {mode === 'signup' ? 'Change details' : 'Change phone number'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {footerLink && (
          <p className="mt-6 text-center text-sm text-neutral">
            {footerLink.text}{' '}
            <Link href={footerLink.href} className="text-gold hover:underline">
              {footerLink.label}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}