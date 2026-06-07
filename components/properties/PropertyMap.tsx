'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

interface PropertyMapProps {
  latitude: number
  longitude: number
  address?: string
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      // Clean up existing map
      if (mapRef.current) {
        mapRef.current.remove()
      }

      // Initialize map
      mapRef.current = L.map(containerRef.current!, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
      })

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current)

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: #D4A017;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <svg style="transform: rotate(45deg);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      // Add marker
      markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(
        mapRef.current
      )
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude])

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-cream-dark"
      />
      {address && (
        <div className="flex items-start gap-2 text-neutral">
          <MapPin className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
          <p className="font-body text-sm">{address}</p>
        </div>
      )}
    </div>
  )
}

export default PropertyMap
