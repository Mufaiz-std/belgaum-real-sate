// 'use client'

// import { useState, useEffect, useCallback, useRef } from 'react'
// import { getFirebaseAuth } from '@/lib/firebase'
// import { setCsrfToken } from '@/lib/api-client'
// import {
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   type ConfirmationResult,
// } from 'firebase/auth'

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier
//   }
// }

// export type AuthStep = 'phone' | 'name' | 'otp'

// interface UseOTPAuthOptions {
//   /** Signup always collects name; login checks phone first */
//   mode?: 'login' | 'signup'
// }

// export function useOTPAuth(options: UseOTPAuthOptions = {}) {
//   const { mode = 'login' } = options
//   const [step, setStep] = useState<AuthStep>(mode === 'signup' ? 'name' : 'phone')
//   const [phone, setPhone] = useState('')
//   const [name, setName] = useState('')
//   const [isNewUser, setIsNewUser] = useState(mode === 'signup')
//   const [otp, setOtp] = useState(['', '', '', '', '', ''])
//   const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [countdown, setCountdown] = useState(30)
//   const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

//   const startCountdown = useCallback(() => {
//     if (countdownRef.current) clearInterval(countdownRef.current)
//     setCountdown(30)
//     countdownRef.current = setInterval(() => {
//       setCountdown((c) => {
//         if (c <= 1) {
//           if (countdownRef.current) clearInterval(countdownRef.current)
//           return 0
//         }
//         return c - 1
//       })
//     }, 1000)
//   }, [])

//   useEffect(() => {
//     return () => {
//       if (countdownRef.current) clearInterval(countdownRef.current)
//     }
//   }, [])

//   const setupRecaptcha = () => {
//     const auth = getFirebaseAuth()
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
//         size: 'invisible',
//       })
//     }
//     return window.recaptchaVerifier
//   }

//   const checkPhone = async () => {
//     const res = await fetch('/api/auth/check-phone', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ phone }),
//     })
//     const data = await res.json()
//     if (!res.ok) throw new Error(data.error || 'Phone check failed')
//     if (data.banned) throw new Error(data.error || 'Account suspended')
//     return data as { exists: boolean; registered: boolean }
//   }

//   const sendOTP = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const auth = getFirebaseAuth()
//       const verifier = setupRecaptcha()
//       const result = await signInWithPhoneNumber(auth, '+91' + phone, verifier)
//       setConfirmationResult(result)
//       setStep('otp')
//       startCountdown()
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : 'Failed to send OTP'
//       setError(message)
//       if (window.recaptchaVerifier) {
//         window.recaptchaVerifier.clear()
//         window.recaptchaVerifier = undefined
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const proceedFromPhone = async () => {
//     if (phone.length !== 10) {
//       setError('Please enter a valid 10-digit mobile number')
//       return
//     }

//     setLoading(true)
//     setError(null)
//     try {
//       if (mode === 'signup') {
//         setIsNewUser(true)
//         setStep('name')
//         return
//       }

//       const result = await checkPhone()
//       if (result.registered) {
//         setIsNewUser(false)
//         await sendOTP()
//       } else {
//         setIsNewUser(true)
//         setStep('name')
//       }
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Something went wrong')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const proceedFromName = async () => {
//     if (!name.trim() || name.trim().length < 2) {
//       setError('Please enter your full name')
//       return
//     }
//     if (phone.length !== 10) {
//       setError('Please enter a valid 10-digit mobile number')
//       return
//     }

//     if (mode === 'signup') {
//       setLoading(true)
//       setError(null)
//       try {
//         const result = await checkPhone()
//         if (result.registered) {
//           setError('This number is already registered. Please sign in instead.')
//           return
//         }
//         setIsNewUser(true)
//       } catch (err: unknown) {
//         setError(err instanceof Error ? err.message : 'Something went wrong')
//         return
//       } finally {
//         setLoading(false)
//       }
//     }

//     await sendOTP()
//   }

//   const verifyOTP = async () => {
//     if (!confirmationResult) return
//     setLoading(true)
//     setError(null)
//     try {
//       const result = await confirmationResult.confirm(otp.join(''))
//       const idToken = await result.user.getIdToken()
//       const res = await fetch('/api/auth/session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           idToken,
//           ...(isNewUser ? { name: name.trim() } : {}),
//         }),
//       })
//       const data = await res.json()
//       if (!res.ok) {
//         if (data.code === 'NAME_REQUIRED') {
//           setIsNewUser(true)
//           setStep('name')
//           setError('Please enter your name to create an account')
//           return
//         }
//         throw new Error(data.error || 'Session creation failed')
//       }
//       if (data.csrfToken) setCsrfToken(data.csrfToken)
//       return data.role as string
//     } catch (err: unknown) {
//       if (err instanceof Error && err.message !== 'Session creation failed') {
//         setError(err.message)
//       } else {
//         setError('Invalid OTP. Please try again.')
//       }
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resendOTP = async () => {
//     setOtp(['', '', '', '', '', ''])
//     if (window.recaptchaVerifier) {
//       window.recaptchaVerifier.clear()
//       window.recaptchaVerifier = undefined
//     }
//     await sendOTP()
//   }

//   return {
//     step,
//     setStep,
//     phone,
//     setPhone,
//     name,
//     setName,
//     isNewUser,
//     otp,
//     setOtp,
//     proceedFromPhone,
//     proceedFromName,
//     sendOTP,
//     verifyOTP,
//     resendOTP,
//     loading,
//     error,
//     countdown,
//     setError,
//   }
// }
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getFirebaseAuth } from '@/lib/firebase'
import { setCsrfToken } from '@/lib/api-client'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
  }
}

export type AuthStep = 'phone' | 'name' | 'otp'

interface UseOTPAuthOptions {
  /** Signup always collects name; login checks phone first */
  mode?: 'login' | 'signup'
}

export function useOTPAuth(options: UseOTPAuthOptions = {}) {
  const { mode = 'login' } = options
  const [step, setStep] = useState<AuthStep>(mode === 'signup' ? 'name' : 'phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [isNewUser, setIsNewUser] = useState(mode === 'signup')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(30)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(30)
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // // FIXED: Removed the hardcoded string container target dependency 
  // const setupRecaptcha = () => {
  //   const auth = getFirebaseAuth()
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(auth, {
  //       size: 'invisible',
  //     })
  //   }
  //   return window.recaptchaVerifier
  // }

  // FIXED: Explicitly providing a target identifier for the invisible verifier handshake
  const setupRecaptcha = () => {
    const auth = getFirebaseAuth()
    if (!window.recaptchaVerifier) {
      // 1. Create a dummy container dynamically in document memory
      const dummyContainer = document.createElement('div')
      dummyContainer.id = 'hidden-recaptcha-fallback'
      document.body.appendChild(dummyContainer) // Attach it cleanly out of view

      // 2. Initialize the standard invisible verifier explicitly
      window.recaptchaVerifier = new RecaptchaVerifier(auth, dummyContainer, {
        size: 'invisible',
      })
    }
    return window.recaptchaVerifier
  }

  const checkPhone = async () => {
    const res = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Phone check failed')
    if (data.banned) throw new Error(data.error || 'Account suspended')
    return data as { exists: boolean; registered: boolean }
  }

  const sendOTP = async () => {
    setLoading(true)
    setError(null)
    try {
      const auth = getFirebaseAuth()
      const verifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, '+91' + phone, verifier)
      setConfirmationResult(result)
      setStep('otp')
      startCountdown()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(message)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    } finally {
      setLoading(false)
    }
  }

  const proceedFromPhone = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (mode === 'signup') {
        setIsNewUser(true)
        setStep('name')
        return
      }

      const result = await checkPhone()
      if (result.registered) {
        setIsNewUser(false)
        await sendOTP()
      } else {
        setIsNewUser(true)
        setStep('name')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const proceedFromName = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name')
      return
    }
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    if (mode === 'signup') {
      setLoading(true)
      setError(null)
      try {
        const result = await checkPhone()
        if (result.registered) {
          setError('This number is already registered. Please sign in instead.')
          return
        }
        setIsNewUser(true)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        return
      } finally {
        setLoading(false)
      }
    }

    await sendOTP()
  }

  const verifyOTP = async () => {
    if (!confirmationResult) return
    setLoading(true)
    setError(null)
    try {
      const result = await confirmationResult.confirm(otp.join(''))
      const idToken = await result.user.getIdToken()
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          ...(isNewUser ? { name: name.trim() } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'NAME_REQUIRED') {
          setIsNewUser(true)
          setStep('name')
          setError('Please enter your name to create an account')
          return
        }
        throw new Error(data.error || 'Session creation failed')
      }
      if (data.csrfToken) setCsrfToken(data.csrfToken)
      return data.role as string
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'Session creation failed') {
        setError(err.message)
      } else {
        setError('Invalid OTP. Please try again.')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setOtp(['', '', '', '', '', ''])
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = undefined
    }
    await sendOTP()
  }

  return {
    step,
    setStep,
    phone,
    setPhone,
    name,
    setName,
    isNewUser,
    otp,
    setOtp,
    proceedFromPhone,
    proceedFromName,
    sendOTP,
    verifyOTP,
    resendOTP,
    loading,
    error,
    countdown,
    setError,
  }
}