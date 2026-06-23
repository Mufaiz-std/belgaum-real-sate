'use client'

/**
 * PropertyMap — pure map renderer.
 *
 * ARCHITECTURE RULE:
 *   This component performs NO geocoding and makes NO external API calls.
 *   Latitude and longitude must be resolved server-side (see lib/geocoding.ts)
 *   and stored in the database before this component is used.
 *
 * Rendering logic:
 *   - latitude + longitude present → render Leaflet map with a gold pin marker
 *   - null / undefined              → render "Location not available" placeholder
 */

import { useEffect, useRef, useState } from 'react'
import { MapPin, MapPinOff, ArrowLeft, Maximize2 } from 'lucide-react'
import type { Map as LeafletMap } from 'leaflet'

interface PropertyMapProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  address?: string
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const hasCoords = latitude != null && longitude != null

  // Handle phone backswipe / back button
  useEffect(() => {
    const handlePopState = () => {
      if (isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      window.addEventListener('popstate', handlePopState)
      document.body.style.overflow = 'hidden' // Prevent underlying page scroll
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  // Fix Leaflet layout on resize/fullscreen toggle
  useEffect(() => {
    if (mapRef.current) {
      if (isFullscreen) {
        mapRef.current.scrollWheelZoom.enable()
      } else {
        mapRef.current.scrollWheelZoom.disable()
      }
      setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 50)
    }
  }, [isFullscreen])

  const openFullscreen = () => {
    if (!hasCoords) return
    setIsFullscreen(true)
    window.history.pushState({ mapFullscreen: true }, '')
  }

  const closeFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (isFullscreen) {
      window.history.back() // Triggers popstate which sets isFullscreen to false
    }
  }

  useEffect(() => {
    if (!hasCoords || !containerRef.current) return

    let cancelled = false

    const initMap = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !containerRef.current) return

      // Destroy any previous Leaflet instance
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Initialise map centred on stored coordinates
      mapRef.current = L.map(containerRef.current, {
        center: [latitude!, longitude!],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false, // Disabled initially, enabled on fullscreen
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Gold teardrop pin
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:40px;height:40px;
          background:#D4A017;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          border:3px solid #fff;
          box-shadow:0 4px 12px rgba(0,0,0,.3);
        "><svg style="transform:rotate(45deg)" width="20" height="20"
          viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      L.marker([latitude!, longitude!], { icon }).addTo(mapRef.current)
    }

    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, hasCoords])

  if (!hasCoords) {
    return (
      <div className="space-y-3">
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-cream-dark bg-cream/60">
          <MapPinOff className="h-8 w-8 text-neutral/40" />
          <p className="font-mono text-sm text-neutral/60">Location not available</p>
        </div>
        {address && (
          <div className="flex items-start gap-2 text-dark">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
            <p className="font-body text-base font-bold">{address}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-[100] bg-cream'
            : 'group relative h-64 w-full overflow-hidden rounded-xl border border-cream-dark'
        }
      >
        <div ref={containerRef} className="h-full w-full" />
        
        {isFullscreen && (
          <button
            onClick={closeFullscreen}
            className="absolute left-4 top-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white text-dark shadow-lg border border-cream-dark transition-transform active:scale-95"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}

        {!isFullscreen && (
          <div
            className="absolute inset-0 z-[400] flex cursor-pointer items-center justify-center bg-dark/0 transition-colors hover:bg-dark/5"
            onClick={openFullscreen}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-5 w-5 text-dark" />
            </div>
          </div>
        )}
      </div>
      
      {/* Spacer to prevent layout shift when map is fixed */}
      {isFullscreen && <div className="h-64 w-full" />}

      {address && (
        <div className="flex items-start gap-2 text-dark">
          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
          <p className="font-body text-base font-bold">{address}</p>
        </div>
      )}
    </div>
  )
}

export default PropertyMap
