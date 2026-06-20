export const FALLBACK_IMAGE = {
  src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
  alt: 'Hostel room preview',
}

export const normalizeHostel = (hostel) => {
  const images =
    Array.isArray(hostel.images) && hostel.images.length > 0
      ? hostel.images.map((image) => ({
          src: image.url ?? image.src ?? FALLBACK_IMAGE.src,
          alt: image.alt ?? image.alt_text ?? FALLBACK_IMAGE.alt,
        }))
      : [FALLBACK_IMAGE]

  return {
    id: hostel.id,
    name: hostel.name ?? 'Untitled Hostel',
    area: hostel.area ?? hostel.location ?? '',
    distanceKm: Number(hostel.distanceKm ?? hostel.distance_km ?? 0),
    roomType: hostel.roomType ?? hostel.room_type ?? 'Single Room',
    description: hostel.description ?? '',
    rating: Number(hostel.rating ?? hostel.averageRating ?? hostel.average_rating ?? 0),
    averageRating: Number(hostel.averageRating ?? hostel.average_rating ?? hostel.rating ?? 0),
    reviews: Number(hostel.reviewsCount ?? hostel.reviews_count ?? 0),
    price: Number(hostel.price ?? 0),
    utilitiesIncluded: Boolean(hostel.utilitiesIncluded ?? hostel.utilities_included),
    availability: hostel.availability ?? 'available',
    aiPick: Boolean(hostel.aiPick ?? hostel.ai_pick),
    verified: Boolean(hostel.verified),
    markerX: Number(hostel.markerX ?? hostel.marker_x ?? 50),
    markerY: Number(hostel.markerY ?? hostel.marker_y ?? 50),
    images,
  }
}
