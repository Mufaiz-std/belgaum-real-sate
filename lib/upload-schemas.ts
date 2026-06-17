import { z } from 'zod'

export const step1BaseSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  propertyType: z.string().min(1, 'Please select property type'),
  transactionType: z.literal('SALE'),
  price: z.number().min(1, 'Price is required'),
  isPricePerSqFt: z.boolean().optional(),
  isNegotiable: z.boolean().optional(),
  isFree: z.boolean().optional(),
  area: z.string().min(1, 'Please select an area'),
  fullAddress: z.string().min(10, 'Please enter full address'),
  landmark: z.string().optional(),
  dimensions: z.string().optional(),
  contactNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

export const step1Schema = step1BaseSchema.refine(data => data.isPricePerSqFt || data.price >= 100000, {
  message: 'Minimum price ₹1,00,000',
  path: ['price'],
})

export const step2Schema = z.object({
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  balconies: z.number().min(0).max(10).optional(),
  parking: z.number().min(0).max(10).optional(),
  floor: z.number().min(0).max(100).optional(),
  totalFloors: z.number().min(1).max(100).optional(),
  propertyAge: z.enum(['NEW', '1-5', '5-10', '10-20', '20+']).optional(),
  furnished: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED']).optional(),
})

export const step3Schema = z.object({
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).optional(),
})

export const step4Schema = z.object({
  images: z.array(z.string()).min(0, 'Upload photos').max(5),
})

export const fullPropertySchema = step1BaseSchema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .refine(data => data.isPricePerSqFt || data.price >= 100000, {
    message: 'Minimum price ₹1,00,000',
    path: ['price'],
  })

export type PropertyFormData = z.infer<typeof fullPropertySchema>

export const INITIAL_FORM_DATA: PropertyFormData = {
  title: '',
  propertyType: 'HOUSE',
  transactionType: 'SALE',
  price: 0,
  isPricePerSqFt: false,
  isNegotiable: false,
  isFree: false,
  area: '',
  fullAddress: '',
  landmark: '',
  dimensions: '',
  contactNumber: '',
  whatsappNumber: '',
  bedrooms: undefined,
  bathrooms: undefined,
  balconies: undefined,
  parking: undefined,
  floor: undefined,
  totalFloors: undefined,
  propertyAge: undefined,
  furnished: undefined,
  description: '',
  amenities: [],
  images: [],
}
