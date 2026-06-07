export function formatIndianPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatIndianNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function parseIndianNumber(value: string): number {
  return Number(value.replace(/[^\d]/g, '')) || 0
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith('91') ? digits.slice(2) : digits
  if (local.length < 4) return phone
  return `+91 ${local.slice(0, 2)}XXXX${local.slice(-4)}`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
