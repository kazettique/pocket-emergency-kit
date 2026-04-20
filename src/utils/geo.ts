const EARTH_RADIUS_M = 6_371_008.8

export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = Math.PI / 180
  const phi1 = a.lat * rad
  const phi2 = b.lat * rad
  const dPhi = (b.lat - a.lat) * rad
  const dLambda = (b.lng - a.lng) * rad

  const h =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function formatDistance(meters: number, lang: 'ja' | 'en'): string {
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10
    return lang === 'en' ? `${rounded} m` : `${rounded}m`
  }
  const km = (meters / 1000).toFixed(meters < 10_000 ? 1 : 0)
  return lang === 'en' ? `${km} km` : `${km}km`
}
