import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { getReviews } from '../../services/reviews.service'
import '../../styles/dashboard/reviews.css'

const formatReviewDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
}

const renderStars = (rating) => {
  const filled = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

const ReviewList = forwardRef(function ReviewList({ hostelId, showSummary = false }, ref) {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getReviews(hostelId)
      setReviews(response.reviews ?? [])
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load reviews.')
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }, [hostelId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useImperativeHandle(ref, () => ({ refresh: loadReviews }), [loadReviews])

  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0

  return (
    <section className="review-list">
      <h3 className="review-list-title">Reviews</h3>

      {showSummary && !isLoading && !error && reviewCount > 0 ? (
        <div className="review-summary">
          <span className="review-summary-stars" aria-hidden="true">
            {renderStars(averageRating)}
          </span>
          <span className="review-summary-value">
            {averageRating.toFixed(1)} / 5 from {reviewCount} review{reviewCount === 1 ? '' : 's'}
          </span>
        </div>
      ) : null}

      {isLoading ? (
        <p className="review-list-status">Loading reviews...</p>
      ) : error ? (
        <p className="review-list-status">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="review-list-status">No reviews yet.</p>
      ) : (
        <ul className="review-list-items">
          {reviews.map((review) => (
            <li key={review.id} className="review-item">
              <div className="review-item-head">
                <span className="review-item-name">{review.reviewerName || 'Student'}</span>
                <span className="review-item-stars" aria-label={`${review.rating} out of 5`}>
                  {renderStars(review.rating)}
                </span>
              </div>
              <div className="review-item-date">{formatReviewDate(review.createdAt)}</div>
              {review.comment ? <p className="review-item-comment">{review.comment}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
})

export default ReviewList
