'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SettingsForm } from '@/components/dashboard/SettingsForm'
import { Area, PlanConfig, PropertyTypeConfig } from '@prisma/client'
import { toast } from 'sonner'



type Tab = 'profile' | 'plans' | 'areas' | 'types'

interface Props {
  phone: string
  initialName: string | null
  initialEmail: string | null
  initialAreas: Area[]
  initialPropertyTypes: PropertyTypeConfig[]
  initialPlans: PlanConfig[]
}

export default function AdminSettingsClient({
  phone,
  initialName,
  initialEmail,
  initialAreas,
  initialPropertyTypes,
  initialPlans,
}: Props) {
  const [tab, setTab] = useState<Tab>('profile')
  const [areas, setAreas] = useState(initialAreas)
  const [newArea, setNewArea] = useState('')

  const [propertyTypes, setPropertyTypes] = useState(initialPropertyTypes)
  const [newPropertyType, setNewPropertyType] = useState('')

  const [plans, setPlans] = useState(initialPlans)
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'My Profile' },
    { id: 'plans', label: 'Plans' },
    { id: 'areas', label: 'Areas' },
    { id: 'types', label: 'Property Types' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-dark">Settings</h1>

      <div className="flex gap-2 border-b border-cream-dark">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 font-body text-sm',
              tab === t.id ? 'border-b-2 border-gold text-gold' : 'text-neutral'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {tab === 'profile' && (
        <SettingsForm
          phone={phone}
          initialData={{ name: initialName, email: initialEmail }}
        />
      )}

      {/* ── Plans Tab ── */}
      {tab === 'plans' && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-dark text-left text-sm text-neutral">
                <th className="p-4">Plan Key</th>
                <th className="p-4">Name</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Price</th>
                <th className="p-4">Daily Limit</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-cream-dark/50">
                  <td className="p-4 font-medium">{plan.planKey}</td>
                  <td className="p-4">{plan.name}</td>
                  <td className="p-4">{plan.duration}</td>
                  <td className="p-4 font-mono">₹{plan.price.toLocaleString('en-IN')}</td>
                  <td className="p-4">{plan.dailyLimit}</td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 text-sm text-neutral">
            Plans dictate what users can do. Edit pricing or limits below.
          </p>

          {editingPlan && (
            <div className="p-4 border-t border-cream-dark bg-cream/5">
              <h3 className="font-headline text-lg text-dark mb-4">Edit {editingPlan.name} Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Duration Text</label>
                  <Input
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Daily Limit</label>
                  <Input
                    type="number"
                    value={editingPlan.dailyLimit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={async () => {
                    const res = await fetch('/api/admin/settings/plans', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(editingPlan),
                    })
                    if (res.ok) {
                      setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p))
                      setEditingPlan(null)
                      toast.success('Plan updated')
                    } else {
                      toast.error('Failed to update plan')
                    }
                  }}
                  className="bg-gold text-dark"
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Areas Tab ── */}
      {tab === 'areas' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <ul className="space-y-2">
            {areas.map((area) => (
              <li
                key={area.id}
                className="flex items-center justify-between rounded-lg border border-cream-dark px-4 py-2"
              >
                <span className="font-body">{area.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-success">Active</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error h-auto p-1"
                    onClick={async () => {
                      if (!confirm(`Remove ${area.name}?`)) return
                      const res = await fetch(`/api/admin/settings/areas?id=${area.id}`, { method: 'DELETE' })
                      if (res.ok) {
                        setAreas(areas.filter(a => a.id !== area.id))
                        toast.success('Area removed')
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
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
              onClick={async () => {
                if (!newArea.trim()) return
                const res = await fetch('/api/admin/settings/areas', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newArea.trim() }),
                })
                const data = await res.json()
                if (res.ok) {
                  setAreas([...areas, data.area])
                  setNewArea('')
                  toast.success('Area added')
                } else {
                  toast.error(data.error || 'Failed to add area')
                }
              }}
            >
              Add Area
            </Button>
          </div>
        </div>
      )}

      {/* ── Property Types Tab ── */}
      {tab === 'types' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <ul className="grid gap-2 sm:grid-cols-2">
            {propertyTypes.map((type) => (
              <li
                key={type.id}
                className="flex justify-between items-center rounded-lg border border-cream-dark px-4 py-3 font-mono text-sm"
              >
                {type.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error h-auto p-1"
                  onClick={async () => {
                    if (!confirm(`Remove ${type.name}?`)) return
                    const res = await fetch(`/api/admin/settings/property-types?id=${type.id}`, { method: 'DELETE' })
                    if (res.ok) {
                      setPropertyTypes(propertyTypes.filter(t => t.id !== type.id))
                      toast.success('Property type removed')
                    }
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2 max-w-sm">
            <Input
              placeholder="New property type (e.g. DUPLEX)..."
              value={newPropertyType}
              onChange={(e) => setNewPropertyType(e.target.value)}
            />
            <Button
              onClick={async () => {
                if (!newPropertyType.trim()) return
                const res = await fetch('/api/admin/settings/property-types', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newPropertyType.trim().toUpperCase() }),
                })
                const data = await res.json()
                if (res.ok) {
                  setPropertyTypes([...propertyTypes, data.propertyType])
                  setNewPropertyType('')
                  toast.success('Property type added')
                } else {
                  toast.error(data.error || 'Failed to add type')
                }
              }}
            >
              Add Type
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
