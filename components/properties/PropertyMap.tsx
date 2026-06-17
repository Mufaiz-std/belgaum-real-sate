'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

interface PropertyMapProps {
  latitude: number | null
  longitude: number | null
  address?: string
  fallbackAreaString?: string
}

export function PropertyMap({ latitude, longitude, address, fallbackAreaString }: PropertyMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    const initMap = async () => {
      let finalLat = latitude
      let finalLng = longitude
      let isExact = true

      if (finalLat === null || finalLng === null) {
        isExact = false
        if (fallbackAreaString) {
          try {
            const query = encodeURIComponent(fallbackAreaString)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
            const data = await response.json()
            if (data && data.length > 0) {
              finalLat = parseFloat(data[0].lat)
              finalLng = parseFloat(data[0].lon)
            }
          } catch (e) {
            console.error('Fallback geocoding failed', e)
          }
        }
        
        // Final fallback to Camp, Belagavi
        if (finalLat === null || finalLng === null) {
          finalLat = 15.8497
          finalLng = 74.4977
        }
      }

      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      // Clean up existing map
      if (mapRef.current) {
        mapRef.current.remove()
      }

      // Initialize map
      mapRef.current = L.map(containerRef.current!, {
        center: [finalLat, finalLng],
        zoom: isExact ? 15 : 14,
        zoomControl: true,
      })

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current)

      if (isExact) {
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
        L.marker([finalLat, finalLng], { icon: customIcon }).addTo(mapRef.current)
      } else {
        // Draw area marking (circle)
        L.circle([finalLat, finalLng], {
          color: '#D4A017',
          fillColor: '#D4A017',
          fillOpacity: 0.2,
          radius: 600, // 600 meters radius
          weight: 2,
        }).addTo(mapRef.current)
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, fallbackAreaString])

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
