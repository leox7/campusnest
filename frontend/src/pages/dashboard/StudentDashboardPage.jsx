import { useEffect, useRef, useState } from 'react'
import HostelCard from '../../components/dashboard/HostelCard'
import { getHostels, getSavedHostels, saveHostel } from '../../services/hostels.service'
import '../../styles/dashboard/student-dashboard.css'

const ROOM_TYPES = ['Single Room', 'Shared', 'Studio', 'Apartment']
const SORT_OPTIONS = ['Relevance', 'Price', 'Distance', 'Rating']
const FILTER_OPTIONS = [
  { id: 'all', label: '🎯 All' },
  { id: 'top', label: '⭐ Top Rated' },
  { id: 'ai', label: '🤖 AI Recommended' },
  { id: 'verified', label: '✅ Verified' },
  { id: 'near', label: '📍 Near Campus (<2km)' },
  { id: 'budget', label: '💵 Budget Friendly' },
  { id: 'premium', label: '🏆 Premium' },
]

const MIN_PRICE = 5000
const MAX_PRICE = 35000

const FALLBACK_IMAGE = {
  src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
  alt: 'Hostel room preview',
}

const normalizeHostel = (hostel) => {
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
    rating: Number(hostel.rating ?? 0),
    reviews: Number(hostel.reviewsCount ?? hostel.reviews_count ?? 0),
    price: Number(hostel.price ?? 0),
    utilitiesIncluded: Boolean(hostel.utilitiesIncluded ?? hostel.utilities_included),
    aiPick: Boolean(hostel.aiPick ?? hostel.ai_pick),
    verified: Boolean(hostel.verified),
    markerX: Number(hostel.markerX ?? hostel.marker_x ?? 50),
    markerY: Number(hostel.markerY ?? hostel.marker_y ?? 50),
    images,
  }
}

function StudentDashboardPage() {
  const [activeNav, setActiveNav] = useState('Browse Hostels')
  const [locationQuery, setLocationQuery] = useState('')
  const [priceMin, setPriceMin] = useState(9000)
  const [priceMax, setPriceMax] = useState(28000)
  const [roomType, setRoomType] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('Relevance')
  const [hostels, setHostels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [mapView, setMapView] = useState(false)
  const [savedIds, setSavedIds] = useState([])
  const [mobileSearchOpen, setMobileSearchOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return !window.matchMedia('(max-width: 767px)').matches
  })
  const [highlightedId, setHighlightedId] = useState('')

  const cardRefs = useRef({})

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await getSavedHostels()
        const ids = (response.hostels ?? []).map((hostel) => hostel.id)
        setSavedIds(ids)
      } catch {
        setSavedIds([])
      }
    }

    fetchSaved()
  }, [])

  useEffect(() => {
    const fetchHostels = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await getHostels({
          area: locationQuery,
          roomType,
          minPrice: priceMin,
          maxPrice: priceMax,
          filter: activeFilter === 'all' ? undefined : activeFilter,
          sortBy: sortBy.toLowerCase(),
        })
        const normalized = (response.hostels ?? []).map(normalizeHostel)
        setHostels(normalized)
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to load hostels.'
        setLoadError(message)
        setHostels([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHostels()
  }, [activeFilter, locationQuery, priceMax, priceMin, roomType, sortBy])

  const toggleSave = async (id) => {
    try {
      const response = await saveHostel(id)
      setSavedIds((prev) => {
        if (response.saved) {
          return prev.includes(id) ? prev : [...prev, id]
        }
        return prev.filter((item) => item !== id)
      })
    } catch (error) {
      const message = error.response?.data?.message || 'Could not update saved hostels.'
      setLoadError(message)
    }
  }

  const handleMarkerClick = (id) => {
    setHighlightedId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <span className="logo-icon">🏠</span>
          <span>CampusNest AI</span>
        </div>

        <nav className="dashboard-nav">
          {['Browse Hostels', 'My Bookings', 'Messages', 'Saved'].map((item) => (
            <button
              key={item}
              type="button"
              className={`dashboard-nav-link ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="dashboard-header-right">
          <button type="button" className="notif-btn" aria-label="Notifications">
            🔔
            <span className="notif-badge">2</span>
          </button>
          <button type="button" className="profile-avatar" aria-label="Profile">
            S
          </button>
        </div>
      </header>

      <section className="dashboard-hero">
        <h1>Welcome back, Student</h1>
        <p>Find your perfect campus accommodation</p>
      </section>

      <section className={`dashboard-search ${mobileSearchOpen ? 'open' : 'collapsed'}`}>
        <button
          type="button"
          className="search-collapse-toggle"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
        >
          {mobileSearchOpen ? 'Hide Search ✕' : '🔍 Search Hostels'}
        </button>

        <div className="dashboard-search-grid">
          <div className="search-field location">
            <span className="field-icon">📍</span>
            <input
              type="text"
              placeholder="University or Area"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
            />
          </div>

          <div className="search-field price">
            <span className="field-icon">💰</span>
            <div className="price-slider-wrap">
              <div
                className="price-slider-active-track"
                style={{
                  left: `${((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                  right: `${100 - ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                }}
              />
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={500}
                value={priceMin}
                onChange={(event) => setPriceMin(Math.min(Number(event.target.value), priceMax - 500))}
                aria-label="Minimum monthly rent"
              />
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={500}
                value={priceMax}
                onChange={(event) => setPriceMax(Math.max(Number(event.target.value), priceMin + 500))}
                aria-label="Maximum monthly rent"
              />
            </div>
            <p>
              KES {priceMin.toLocaleString('en-KE')} - KES {priceMax.toLocaleString('en-KE')}
            </p>
          </div>

          <div className="search-field room-type">
            <span className="field-icon">🛏️</span>
            <select value={roomType} onChange={(event) => setRoomType(event.target.value)}>
              <option value="">All room types</option>
              {ROOM_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="search-cta">
            🔍 Search
          </button>
        </div>
      </section>

      <main className="dashboard-main">
        <section className="dashboard-filters">
          <div className="filter-pills">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            <button
              type="button"
              className="map-toggle-btn"
              onClick={() => setMapView((prev) => !prev)}
              aria-label="Toggle map view"
            >
              {mapView ? '📋' : '🗺️'}
            </button>

            <label className="sort-select-wrap">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    Sort by: {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={`results-layout ${mapView ? 'map-open' : ''}`}>
          <div className="hostels-grid">
            {isLoading ? <p>Loading hostels...</p> : null}
            {!isLoading && loadError ? <p>{loadError}</p> : null}
            {!isLoading && !loadError && hostels.length === 0 ? <p>No hostels found.</p> : null}
            {!isLoading &&
              !loadError &&
              hostels.map((hostel) => (
              <div
                key={hostel.id}
                ref={(node) => {
                  cardRefs.current[hostel.id] = node
                }}
              >
                <HostelCard
                  hostel={hostel}
                  isSaved={savedIds.includes(hostel.id)}
                  onToggleSave={toggleSave}
                  isHighlighted={highlightedId === hostel.id}
                  onHover={() => setHighlightedId(hostel.id)}
                />
              </div>
              ))}
          </div>

          <aside className="map-panel">
            <div className="map-canvas">
              <p>CampusNest Hostel Map</p>
              {hostels.map((hostel) => (
                <button
                  key={hostel.id}
                  type="button"
                  className={`map-marker ${highlightedId === hostel.id ? 'active' : ''}`}
                  style={{ left: `${hostel.markerX}%`, top: `${hostel.markerY}%` }}
                  onClick={() => handleMarkerClick(hostel.id)}
                  aria-label={`Show ${hostel.name}`}
                >
                  📍
                </button>
              ))}
            </div>
          </aside>
        </section>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile dashboard navigation">
        <button type="button">Browse</button>
        <button type="button">Saved</button>
        <button type="button">Messages</button>
        <button type="button">Profile</button>
      </nav>
    </div>
  )
}

export default StudentDashboardPage
