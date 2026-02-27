import { useState } from 'react'

function HostelCard({ hostel, isSaved, onToggleSave, isHighlighted, onHover }) {
  const [activeImage, setActiveImage] = useState(0)
  const [loadedImages, setLoadedImages] = useState({})

  const handleMove = (direction) => {
    setActiveImage((prev) => (prev + direction + hostel.images.length) % hostel.images.length)
  }

  const renderStars = (rating) => {
    const filled = Math.round(rating)
    return Array.from({ length: 5 }, (_, index) => (index < filled ? '★' : '☆')).join('')
  }

  const currentImage = hostel.images[activeImage]

  return (
    <article
      className={`hostel-card ${isHighlighted ? 'highlighted' : ''}`}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <div className="hostel-card-image-wrap">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          loading="lazy"
          onLoad={() => setLoadedImages((prev) => ({ ...prev, [activeImage]: true }))}
          className={`hostel-card-image ${loadedImages[activeImage] ? 'loaded' : ''}`}
        />

        <div className="hostel-card-badges">
          {hostel.aiPick ? <span className="hostel-badge ai">🤖 AI Pick</span> : null}
          {hostel.verified ? <span className="hostel-badge verified">✅ Verified</span> : null}
        </div>

        <button
          type="button"
          className="carousel-arrow prev"
          onClick={() => handleMove(-1)}
          aria-label="Previous hostel image"
        >
          ‹
        </button>
        <button
          type="button"
          className="carousel-arrow next"
          onClick={() => handleMove(1)}
          aria-label="Next hostel image"
        >
          ›
        </button>

        <div className="carousel-dots">
          {hostel.images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={`carousel-dot ${index === activeImage ? 'active' : ''}`}
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      </div>

      <div className="hostel-card-content">
        <div className="hostel-card-top">
          <h3>{hostel.name}</h3>
          <button
            type="button"
            className={`save-heart ${isSaved ? 'saved' : ''}`}
            onClick={() => onToggleSave(hostel.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save hostel'}
          >
            ♥
          </button>
        </div>

        <div className="hostel-meta-row">
          <span className="distance-badge">📍 {hostel.distanceKm}km from campus</span>
          <span className="room-badge">{hostel.roomType}</span>
        </div>

        <div className="hostel-rating-row">
          <span className="stars">{renderStars(hostel.rating)}</span>
          <span className="review-text">
            ({hostel.rating.toFixed(1)} • {hostel.reviews} reviews)
          </span>
        </div>

        <div className="hostel-price-row">
          <p>KSH {hostel.price.toLocaleString('en-KE')}/month</p>
          <span>{hostel.utilitiesIncluded ? 'Utilities included' : 'Utilities billed separately'}</span>
        </div>

        <button type="button" className="details-btn">
          View Details
        </button>
      </div>
    </article>
  )
}

export default HostelCard
