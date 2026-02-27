import { useEffect, useState } from 'react'
import { GALLERY_IMAGES } from '../../constants/auth.constants'

function ImageGallery() {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % GALLERY_IMAGES.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <aside className="gallery-panel">
      {GALLERY_IMAGES.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`gallery-image ${index === activeImage ? 'active' : ''}`}
        />
      ))}
      <div className="gallery-overlay">
        <div className="gallery-copy">
          <h2>Find Your Perfect Campus Home</h2>
          <div className="gallery-dots" aria-label="Gallery indicators">
            {GALLERY_IMAGES.map((image, index) => (
              <button
                type="button"
                key={image.src}
                className={`gallery-dot ${index === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default ImageGallery
