'use server'

import { prisma } from '@/lib/prisma'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'
const CITY_SUFFIX = 'Belagavi, Karnataka, India'

/**
 * SERVER-SIDE ONLY geocoding.
 * Call this when saving a property (submitProperty / updateProperty).
 *
 * Geocoding order (area first — more reliable for local Belagavi neighborhoods):
 *  1. area + "Belagavi, Karnataka, India"   ← checks DB cache first
 *  2. fullAddress + "Belagavi, Karnataka, India"
 *
 * Returns { latitude, longitude } or null.
 * NEVER returns a hardcoded fallback — caller must treat null gracefully.
 */
export async function geocodeForProperty(
  area: string,
  fullAddress: string | null | undefined
): Promise<{ latitude: number; longitude: number } | null> {
  // ── 1. Check area cache in DB ────────────────────────────────────────────
  const cached = await getCachedAreaCoords(area)
  if (cached) return cached

  // ── 2. Nominatim: area first (most reliable for Belagavi neighbourhoods)──
  const areaResult = await nominatimSearch(`${area.trim()}, ${CITY_SUFFIX}`)
  if (areaResult) {
    await cacheAreaCoords(area, areaResult.latitude, areaResult.longitude)
    return areaResult
  }

  // ── 3. Nominatim: full address as secondary attempt ──────────────────────
  if (fullAddress?.trim()) {
    const addrResult = await nominatimSearch(`${fullAddress.trim()}, ${CITY_SUFFIX}`)
    if (addrResult) {
      // Don't cache address-level result in Area table — it's property-specific
      return addrResult
    }
  }

  // ── 4. Both failed — store nothing, return null ──────────────────────────
  return null
}

// ─── Area cache helpers ──────────────────────────────────────────────────────

async function getCachedAreaCoords(
  area: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const row = await prisma.area.findUnique({
      where: { name: area },
      select: { geocodedLat: true, geocodedLng: true },
    })
    if (row?.geocodedLat != null && row.geocodedLng != null) {
      return { latitude: row.geocodedLat, longitude: row.geocodedLng }
    }
  } catch (e) {
    console.error('[geocoding] Cache read error for area:', area, e)
  }
  return null
}

async function cacheAreaCoords(area: string, lat: number, lng: number) {
  try {
    await prisma.area.updateMany({
      where: { name: area },
      data: { geocodedLat: lat, geocodedLng: lng },
    })
  } catch (e) {
    // Non-fatal: caching is best-effort
    console.error('[geocoding] Cache write error for area:', area, e)
  }
}

// ─── Internal Nominatim search ───────────────────────────────────────────────

async function nominatimSearch(
  query: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const url =
      `${NOMINATIM_BASE}` +
      `?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'XcityRealEstateApp/1.0' },
    })

    if (!response.ok) return null

    const data = await response.json()
    if (data?.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      }
    }
  } catch (error) {
    console.error('[geocoding] Nominatim error for query:', query, error)
  }
  return null
}
