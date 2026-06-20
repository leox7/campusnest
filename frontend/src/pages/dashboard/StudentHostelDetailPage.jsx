import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StudentDashboardLayout from '../../components/dashboard/StudentDashboardLayout'
import { getHostelById, getSavedHostels, saveHostel } from '../../services/hostels.service'
import { normalizeHostel } from '../../utils/hostel.utils'
import '../../styles/dashboard/student-hostel-detail.css'

const renderStars = (rating) => {
  const filled = Math.round(rating)
  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`star ${index < filled ? 'star-filled' : 'star-empty'}`}
      aria-hidden="true"
    />
  ))
}

function StudentHostelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hostel, setHostel] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    let active = true

    const fetchHostel = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await getHostelById(id)
        if (!active) return
        setHostel(response.hostel ? normalizeHostel(response.hostel) : null)
        setActiveImage(0)
      } catch (error) {
        if (!active) return
        const message = error.response?.data?.message || 'Failed to load hostel.'
        setLoadError(message)
        setHostel(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchHostel()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    let active = true

    const fetchSaved = async () => {
      try {
        const response = await getSavedHostels()
        if (!active) return
        const ids = (response.hostels ?? []).map((item) => item.id)
        setIsSaved(ids.includes(Number(id)))
      } catch {
        if (active) setIsSaved(false)
      }
    }

    fetchSaved()

    return () => {
      active = false
    }
  }, [id])

  const handleToggleSave = async () => {
    try {
      const response = await saveHostel(id)
      setIsSaved(Boolean(response.saved))
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not update saved hostels.')
    }
  }

  const renderBody = () => {
    if (isLoading) return <p className="detail-status">Loading hostel...</p>
    if (loadError) return <p className="detail-status">{loadError}</p>
    if (!hostel) return <p className="detail-status">Hostel not found.</p>

    const currentImage = hostel.images[activeImage] ?? hostel.images[0]

    return (
      <article className="hostel-detail">
        <div className="hostel-detail-gallery">
          <img
            className="hostel-detail-image"
            src={currentImage.src}
            alt={currentImage.alt}
            loading="lazy"
          />
          {hostel.images.length > 1 ? (
            <div className="hostel-detail-thumbs">
              {hostel.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  className={`hostel-detail-thumb ${index === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="hostel-detail-info">
          <div className="hostel-detail-heading">
            <h1>{hostel.name}</h1>
            <button
              type="button"
              className={`save-heart ${isSaved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              aria-label={isSaved ? 'Remove from saved' : 'Save hostel'}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="hostel-detail-badges">
            {hostel.aiPick ? <span className="hostel-badge ai">AI Pick</span> : null}
            {hostel.verified ? (
              <span className="hostel-badge verified">Verified</span>
            ) : (
              <span className="hostel-badge pending">Pending verification</span>
            )}
          </div>

          <div className="hostel-detail-rating">
            <span className="stars">{renderStars(hostel.averageRating)}</span>
            <span className="review-text">
              ({hostel.averageRating.toFixed(1)} • {hostel.reviews} reviews)
            </span>
          </div>

          <div className="hostel-detail-meta">
            <span className="meta-chip">{hostel.area || 'Location not set'}</span>
            <span className="meta-chip">{hostel.distanceKm} km from campus</span>
            <span className="meta-chip">{hostel.roomType}</span>
            <span className="meta-chip">
              {hostel.utilitiesIncluded ? 'Utilities included' : 'Utilities billed separately'}
            </span>
            <span className="meta-chip">
              {hostel.availability === 'full' ? 'Fully booked' : 'Available'}
            </span>
          </div>

          <p className="hostel-detail-price">
            KSH {hostel.price.toLocaleString('en-KE')}/month
          </p>

          <div className="hostel-detail-description">
            <h2>About this hostel</h2>
            <p>{hostel.description || 'No description provided.'}</p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <StudentDashboardLayout activeNav="Browse Hostels">
      <main className="hostel-detail-page">
        <button
          type="button"
          className="detail-back-link"
          onClick={() => navigate('/dashboard/student')}
        >
          Back to browse
        </button>
        {renderBody()}
      </main>
    </StudentDashboardLayout>
  )
}

export default StudentHostelDetailPage
