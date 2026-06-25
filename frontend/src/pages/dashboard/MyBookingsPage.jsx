import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentDashboardLayout from '../../components/dashboard/StudentDashboardLayout'
import {
  cancelBooking,
  getMyBookings,
  getPayment,
  payBooking,
} from '../../services/bookings.service'
import '../../styles/dashboard/bookings.css'

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatPrice = (value) =>
  value === null || value === undefined ? '-' : `KSH ${Number(value).toLocaleString('en-KE')}`

function MyBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [receipts, setReceipts] = useState({})

  const loadBookings = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const response = await getMyBookings()
      setBookings(response.bookings ?? [])
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Failed to load bookings.')
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (id) => {
    setActionError('')
    setBusyId(id)
    try {
      await cancelBooking(id)
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        )
      )
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not cancel booking.')
    } finally {
      setBusyId(null)
    }
  }

  const handlePay = async (id) => {
    setActionError('')
    setBusyId(id)
    try {
      const response = await payBooking(id)
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: 'confirmed' } : booking
        )
      )
      if (response.payment) {
        setReceipts((prev) => ({ ...prev, [id]: response.payment }))
      }
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not complete payment.')
    } finally {
      setBusyId(null)
    }
  }

  const handleViewReceipt = async (id) => {
    setActionError('')
    setBusyId(id)
    try {
      const response = await getPayment(id)
      if (response.payment) {
        setReceipts((prev) => ({ ...prev, [id]: response.payment }))
      }
    } catch (error) {
      setActionError(error.response?.data?.message || 'No receipt available yet.')
    } finally {
      setBusyId(null)
    }
  }

  const renderActions = (booking) => {
    const isBusy = busyId === booking.id

    if (booking.status === 'pending') {
      return (
        <div className="booking-actions">
          <button
            type="button"
            className="booking-btn pay"
            onClick={() => handlePay(booking.id)}
            disabled={isBusy}
          >
            {isBusy ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            type="button"
            className="booking-btn cancel"
            onClick={() => handleCancel(booking.id)}
            disabled={isBusy}
          >
            Cancel
          </button>
        </div>
      )
    }

    if (booking.status === 'confirmed') {
      return (
        <div className="booking-actions">
          <button
            type="button"
            className="booking-btn"
            onClick={() => handleViewReceipt(booking.id)}
            disabled={isBusy}
          >
            View Receipt
          </button>
        </div>
      )
    }

    return null
  }

  const renderReceipt = (booking) => {
    const receipt = receipts[booking.id]
    if (!receipt) return null
    return (
      <div className="booking-receipt">
        <h3>Payment Receipt</h3>
        <div className="booking-receipt-row">
          <span>Amount</span>
          <span>{formatPrice(receipt.amount)}</span>
        </div>
        <div className="booking-receipt-row">
          <span>Method</span>
          <span>{receipt.method || 'Simulated'}</span>
        </div>
        <div className="booking-receipt-row">
          <span>Status</span>
          <span>{receipt.status === 'completed' ? 'Completed' : receipt.status}</span>
        </div>
        <div className="booking-receipt-row">
          <span>Date</span>
          <span>{formatDate(receipt.createdAt)}</span>
        </div>
      </div>
    )
  }

  const renderBody = () => {
    if (isLoading) return <p className="bookings-status">Loading bookings...</p>
    if (loadError) return <p className="bookings-status">{loadError}</p>

    if (!bookings.length) {
      return (
        <div className="bookings-empty">
          <h2>No bookings yet</h2>
          <p>Browse verified hostels and book a place to see it here.</p>
          <button type="button" onClick={() => navigate('/dashboard/student')}>
            Browse Hostels
          </button>
        </div>
      )
    }

    return (
      <div className="bookings-list">
        {bookings.map((booking) => (
          <article key={booking.id} className="booking-card">
            <div className="booking-card-top">
              <div className="booking-card-title">
                <h2>{booking.hostelName}</h2>
                <p>{booking.location || 'Location not set'}</p>
              </div>
              <span className={`status-badge ${booking.status}`}>
                {STATUS_LABEL[booking.status] || booking.status}
              </span>
            </div>

            <div className="booking-meta">
              <span>
                <strong>Booking date:</strong> {formatDate(booking.bookingDate)}
              </span>
              <span>
                <strong>Room type:</strong> {booking.roomType || '-'}
              </span>
              <span>
                <strong>Price:</strong> {formatPrice(booking.price)}
              </span>
            </div>

            {renderActions(booking)}
            {renderReceipt(booking)}
          </article>
        ))}
      </div>
    )
  }

  return (
    <StudentDashboardLayout activeNav="My Bookings">
      <main className="bookings-page">
        <div className="bookings-page-header">
          <h1>My Bookings</h1>
          <p>Manage your hostel bookings and payments.</p>
        </div>
        {actionError ? <div className="bookings-error">{actionError}</div> : null}
        {renderBody()}
      </main>
    </StudentDashboardLayout>
  )
}

export default MyBookingsPage
