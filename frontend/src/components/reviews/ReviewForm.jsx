import { useState } from 'react'
import { createReview } from '../../services/reviews.service'
import '../../styles/dashboard/reviews.css'

const STAR_VALUES = [1, 2, 3, 4, 5]

function ReviewForm({ hostelId, onReviewAdded }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (rating < 1 || rating > 5) {
      setStatus('error')
      setMessage('Please select a rating from 1 to 5 stars.')
      return
    }

    setStatus('submitting')
    setMessage('')

    try {
      const response = await createReview(Number(hostelId), rating, comment.trim() || undefined)
      setStatus('success')
      setMessage('Review submitted. Thank you for your feedback.')
      setSubmitted(true)
      setComment('')
      if (typeof onReviewAdded === 'function') {
        onReviewAdded(response.review)
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message || 'Could not submit your review.'
      setStatus('error')
      setMessage(apiMessage)
      if (error.response?.status === 409) {
        setSubmitted(true)
      }
    }
  }

  if (submitted && status === 'success') {
    return (
      <div className="review-form-card">
        <p className="review-form-success">{message}</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="review-form-card">
        <p className="review-form-notice">{message || 'You have already reviewed this hostel.'}</p>
      </div>
    )
  }

  const activeStars = hovered || rating

  return (
    <form className="review-form-card" onSubmit={handleSubmit}>
      <h3 className="review-form-title">Leave a review</h3>

      <div className="review-star-input" role="radiogroup" aria-label="Star rating">
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className={`review-star-btn ${value <= activeStars ? 'is-active' : ''}`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
            aria-pressed={value === rating}
          >
            {value <= activeStars ? '★' : '☆'}
          </button>
        ))}
        <span className="review-star-value">{rating > 0 ? `${rating} / 5` : 'No rating'}</span>
      </div>

      <label className="review-form-label" htmlFor="review-comment">
        Comment (optional)
      </label>
      <textarea
        id="review-comment"
        className="review-form-textarea"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="Share your experience with this hostel"
      />

      {status === 'error' ? <p className="review-form-error">{message}</p> : null}

      <button type="submit" className="review-form-submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  )
}

export default ReviewForm
