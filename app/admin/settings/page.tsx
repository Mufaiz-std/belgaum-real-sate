'use client'

import { useState } from 'react'
import { BELAGAVI_AREAS } from '@/lib/constants'
import { PLAN_AMOUNTS, PLAN_DETAILS } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PROPERTY_TYPES = [
  'HOUSE',
  'APARTMENT',
  'VILLA',
  'PLOT',
  'COMMERCIAL',
  'AGRICULTURAL',
] as const

type Tab = 'plans' | 'areas' | 'types'

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('plans')
  const [areas, setAreas] = useState([...BELAGAVI_AREAS])
  const [newArea, setNewArea] = useState('')

  const plans = Object.entries(PLAN_DETAILS).map(([key, details]) => ({
    key,
    ...details,
    price: PLAN_AMOUNTS[key as keyof typeof PLAN_AMOUNTS],
    dailyLimit: 15,
  }))

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-dark">Settings</h1>

      <div className="flex gap-2 border-b border-cream-dark">
        {(['plans', 'areas', 'types'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 font-body text-sm capitalize',
              tab === t ? 'border-b-2 border-gold text-gold' : 'text-neutral'
            )}
          >
            {t === 'types' ? 'Property Types' : t}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-dark text-left text-sm text-neutral">
                <th className="p-4">Plan</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Price</th>
                <th className="p-4">Daily Limit</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.key} className="border-b border-cream-dark/50">
                  <td className="p-4 font-medium">{plan.name}</td>
                  <td className="p-4">{plan.duration}</td>
                  <td className="p-4 font-mono">₹{plan.price.toLocaleString('en-IN')}</td>
                  <td className="p-4">{plan.dailyLimit}</td>
                </tr>
              ))}
              <tr className="border-b border-cream-dark/50">
                <td className="p-4 font-medium">Single</td>
                <td className="p-4">Lifetime</td>
                <td className="p-4 font-mono">₹{PLAN_AMOUNTS.SINGLE}</td>
                <td className="p-4">N/A</td>
              </tr>
            </tbody>
          </table>
          <p className="p-4 text-sm text-neutral">
            Plan prices are configured in lib/pricing.ts. Database-backed plan config can be added in a future release.
          </p>
        </div>
      )}

      {tab === 'areas' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <ul className="space-y-2">
            {areas.map((area) => (
              <li
                key={area}
                className="flex items-center justify-between rounded-lg border border-cream-dark px-4 py-2"
              >
                <span className="font-body">{area}</span>
                <span className="text-xs text-success">Active</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="New area name..."
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
            />
            <Button
              onClick={() => {
                if (newArea.trim()) {
                  setAreas([...areas, newArea.trim()])
                  setNewArea('')
                }
              }}
            >
              Add Area
            </Button>
          </div>
        </div>
      )}

      {tab === 'types' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <ul className="grid gap-2 sm:grid-cols-2">
            {PROPERTY_TYPES.map((type) => (
              <li
                key={type}
                className="rounded-lg border border-cream-dark px-4 py-3 font-mono text-sm"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
