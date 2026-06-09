'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Shield,
  ArrowUpDown,
  Trees,
  Building,
  Dumbbell,
  Waves,
  Lock,
  Camera,
  Droplets,
  Check,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AMENITIES } from '@/lib/constants'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  INITIAL_FORM_DATA,
  type PropertyFormData,
} from '@/lib/upload-schemas'
import { formatIndianNumber, parseIndianNumber } from '@/lib/format'
import { ImageUploadStep } from './ImageUploadStep'
import { submitProperty } from '@/actions/property'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STEPS = ['Basic Info', 'Property Details', 'Description & Features', 'Photos'] as const

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Shield,
  ArrowUpDown,
  Trees,
  Building,
  Dumbbell,
  Waves,
  Lock,
  Camera,
  Droplets,
}

const DRAFT_KEY = 'property-draft'

export function UploadPropertyForm({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [restored, setRestored] = useState(false)
  
  const [areas, setAreas] = useState<string[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.areas) setAreas(data.areas.map((a: any) => a.name))
        if (data.propertyTypes) setPropertyTypes(data.propertyTypes.map((t: any) => t.name))
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        setFormData(JSON.parse(draft))
      } catch {
        /* ignore invalid draft */
      }
    }
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
  }, [formData, restored])

  const isPlotOrAgri =
    formData.propertyType === 'PLOT' || formData.propertyType === 'AGRICULTURAL'

  const updateField = <K extends keyof PropertyFormData>(
    key: K,
    value: PropertyFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const validateStep = (stepIndex: number): boolean => {
    let result
    switch (stepIndex) {
      case 0:
        result = step1Schema.safeParse(formData)
        break
      case 1:
        result = step2Schema.safeParse(formData)
        break
      case 2:
        result = step3Schema.safeParse(formData)
        break
      case 3:
        result = step4Schema.safeParse(formData)
        break
      default:
        return true
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
    toast.success('Draft saved')
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitting(true)
    try {
      await submitProperty(formData)
      localStorage.removeItem(DRAFT_KEY)
      toast.success(isAdmin ? 'Property uploaded successfully!' : "Property submitted for approval! We'll review it within 24 hours.")
      router.push(isAdmin ? '/admin/properties' : '/dashboard/properties')
      router.refresh()
    } catch {
      toast.error('Failed to submit property')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAmenity = (name: string) => {
    const current = formData.amenities || []
    if (current.includes(name)) {
      updateField(
        'amenities',
        current.filter((a) => a !== name)
      )
    } else {
      updateField('amenities', [...current, name])
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border-2 font-mono text-sm transition-colors',
                  index < step
                    ? 'border-gold bg-gold text-dark'
                    : index === step
                      ? 'border-gold bg-gold text-dark'
                      : 'border-neutral/30 bg-white text-neutral'
                )}
              >
                {index < step ? <Check className="size-5" /> : index + 1}
              </div>
              <span className="mt-2 hidden text-center font-body text-xs text-neutral sm:block">
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  index < step ? 'bg-gold' : 'bg-neutral/20'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl bg-white p-6 shadow-sm sm:p-8"
        >
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl text-dark">Basic Information</h2>

              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Spacious 3BHK in Tilakwadi"
                />
                {errors.title && <p className="text-sm text-error">{errors.title}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onChange={(e) =>
                      updateField(
                        'propertyType',
                        e.target.value as PropertyFormData['propertyType']
                      )
                    }
                  >
                    <option value="">Select type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Input value="Sale" disabled className="bg-cream text-neutral" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-neutral">
                    ₹
                  </span>
                  <Input
                    id="price"
                    value={formData.price ? formatIndianNumber(formData.price) : ''}
                    onChange={(e) => updateField('price', parseIndianNumber(e.target.value))}
                    className="pl-8 font-mono"
                    placeholder="10,00,000"
                  />
                </div>
                {errors.price && <p className="text-sm text-error">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label>Area</Label>
                <Select
                  value={formData.area}
                  onChange={(e) => updateField('area', e.target.value)}
                >
                  <option value="">Select area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </Select>
                {errors.area && <p className="text-sm text-error">{errors.area}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">Full Address</Label>
                <Input
                  id="fullAddress"
                  value={formData.fullAddress}
                  onChange={(e) => updateField('fullAddress', e.target.value)}
                  placeholder="House no., street, landmark"
                />
                {errors.fullAddress && (
                  <p className="text-sm text-error">{errors.fullAddress}</p>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl text-dark">Property Details</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                {!isPlotOrAgri && (
                  <>
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Select
                        value={formData.bedrooms?.toString() || ''}
                        onChange={(e) =>
                          updateField(
                            'bedrooms',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                        <option value="5">5+</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <Select
                        value={formData.bathrooms?.toString() || ''}
                        onChange={(e) =>
                          updateField(
                            'bathrooms',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      >
                        <option value="">Select</option>
                        {[1, 2, 3].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                        <option value="4">4+</option>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Balconies</Label>
                  <Select
                    value={formData.balconies?.toString() ?? ''}
                    onChange={(e) =>
                      updateField(
                        'balconies',
                        e.target.value !== '' ? Number(e.target.value) : undefined
                      )
                    }
                  >
                    <option value="">Select</option>
                    {[0, 1, 2].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                    <option value="3">3+</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Parking</Label>
                  <Select
                    value={formData.parking?.toString() ?? ''}
                    onChange={(e) =>
                      updateField(
                        'parking',
                        e.target.value !== '' ? Number(e.target.value) : undefined
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="0">None</option>
                    {[1, 2].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                    <option value="3">3+</option>
                  </Select>
                </div>

                {!isPlotOrAgri && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        type="number"
                        min={0}
                        value={formData.floor ?? ''}
                        onChange={(e) =>
                          updateField(
                            'floor',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalFloors">Total Floors</Label>
                      <Input
                        id="totalFloors"
                        type="number"
                        min={1}
                        value={formData.totalFloors ?? ''}
                        onChange={(e) =>
                          updateField(
                            'totalFloors',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Property Age</Label>
                  <Select
                    value={formData.propertyAge || ''}
                    onChange={(e) =>
                      updateField(
                        'propertyAge',
                        (e.target.value || undefined) as PropertyFormData['propertyAge']
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="NEW">New</option>
                    <option value="1-5">1-5 Yrs</option>
                    <option value="5-10">5-10 Yrs</option>
                    <option value="10-20">10-20 Yrs</option>
                    <option value="20+">20+ Yrs</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Furnished Status</Label>
                  <Select
                    value={formData.furnished || ''}
                    onChange={(e) =>
                      updateField(
                        'furnished',
                        (e.target.value || undefined) as PropertyFormData['furnished']
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="SEMI_FURNISHED">Semi-furnished</option>
                    <option value="FURNISHED">Furnished</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl text-dark">Description & Features</h2>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  maxLength={500}
                  placeholder="Describe your property in detail..."
                  rows={5}
                />
                <p className="font-mono text-xs text-neutral">
                  {formData.description.length} / 500 characters
                </p>
                {errors.description && (
                  <p className="text-sm text-error">{errors.description}</p>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Amenities</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {AMENITIES.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity.icon]
                    const checked = formData.amenities?.includes(amenity.id)
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                          checked
                            ? 'border-gold bg-gold/10'
                            : 'border-neutral/20 hover:border-gold/50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex size-5 items-center justify-center rounded border',
                            checked ? 'border-gold bg-gold' : 'border-neutral/30'
                          )}
                        >
                          {checked && <Check className="size-3 text-dark" />}
                        </div>
                        {Icon && <Icon className="size-5 text-gold" />}
                        <span className="font-body text-sm text-dark">{amenity.id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl text-dark">Photos</h2>
              <ImageUploadStep
                images={formData.images}
                onChange={(images) => updateField('images', images)}
                error={errors.images}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            Back
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={saveDraft}>
            Save Draft
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={goNext}
              className="bg-gold text-dark hover:bg-gold-light"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gold text-dark hover:bg-gold-light"
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                isAdmin ? 'Upload Property' : 'Submit for Approval'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
