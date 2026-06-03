export function googleMapsUrl(lieu) {
  const query = `${lieu.trim()}, Argueil, Seine-Maritime, France`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
