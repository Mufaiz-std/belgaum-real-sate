export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = encodeURIComponent(address)
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'User-Agent': 'BelgaumRealEstateApp/1.0',
      },
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }
  return null
}
