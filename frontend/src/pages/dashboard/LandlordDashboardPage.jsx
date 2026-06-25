import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addLandlordHostelImage,
  createLandlordHostel,
  deleteLandlordHostel,
  deleteLandlordHostelImage,
  getLandlordHostels,
  updateLandlordHostel,
  updateLandlordHostelImage,
} from '../../services/landlordHostels.service'
import { getLandlordBookings } from '../../services/landlordBookings.service'
import '../../styles/dashboard/landlord-dashboard.css'
import '../../styles/dashboard/booking-notifications.css'

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

const formatBookingDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
}

const ROOM_TYPES = ['Single Room', 'Shared', 'Studio', 'Apartment']
const AVAILABILITY = ['available', 'full']

const INITIAL_FORM = {
  name: '',
  location: '',
  room_type: 'Single Room',
  distance_km: '0',
  price: '',
  description: '',
  utilities_included: true,
  availability: 'available',
  marker_x: '50',
  marker_y: '50',
}

function LandlordDashboardPage() {
  const navigate = useNavigate()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [imageFormByHostel, setImageFormByHostel] = useState({})
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  const sortedHostels = useMemo(
    () => [...hostels].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [hostels],
  )

  const loadHostels = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getLandlordHostels()
      setHostels(response.hostels ?? [])
    } catch (fetchError) {
      const message = fetchError.response?.data?.message || 'Failed to load your hostels.'
      setError(message)
      setHostels([])
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    setBookingsLoading(true)
    try {
      const response = await getLandlordBookings()
      setBookings(response.bookings ?? [])
    } catch {
      setBookings([])
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    loadHostels()
    loadBookings()
  }, [])

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const payloadFromForm = () => ({
    ...form,
    distance_km: Number(form.distance_km),
    price: Number(form.price),
    marker_x: Number(form.marker_x),
    marker_y: Number(form.marker_y),
  })

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setIsCreating(false)
  }

  const submitHostel = async (event) => {
    event.preventDefault()
    setError('')
    try {
      if (editingId) {
        await updateLandlordHostel(editingId, payloadFromForm())
      } else {
        await createLandlordHostel(payloadFromForm())
      }
      await loadHostels()
      resetForm()
    } catch (submitError) {
      const message = submitError.response?.data?.message || 'Could not save hostel.'
      setError(message)
    }
  }

  const beginEdit = (hostel) => {
    setIsCreating(true)
    setEditingId(hostel.id)
    setForm({
      name: hostel.name ?? '',
      location: hostel.location ?? '',
      room_type: hostel.room_type ?? 'Single Room',
      distance_km: String(hostel.distance_km ?? 0),
      price: String(hostel.price ?? ''),
      description: hostel.description ?? '',
      utilities_included: Boolean(hostel.utilities_included),
      availability: hostel.availability ?? 'available',
      marker_x: String(hostel.marker_x ?? 50),
      marker_y: String(hostel.marker_y ?? 50),
    })
  }

  const removeHostel = async (hostelId) => {
    const shouldDelete = window.confirm('Delete this hostel listing?')
    if (!shouldDelete) return
    setError('')
    try {
      await deleteLandlordHostel(hostelId)
      await loadHostels()
    } catch (deleteError) {
      const message = deleteError.response?.data?.message || 'Could not delete hostel.'
      setError(message)
    }
  }

  const setImageForm = (hostelId, updates) => {
    setImageFormByHostel((prev) => ({
      ...prev,
      [hostelId]: {
        image_url: '',
        alt_text: '',
        ...prev[hostelId],
        ...updates,
      },
    }))
  }

  const addImage = async (hostelId) => {
    const imageInput = imageFormByHostel[hostelId] || { image_url: '', alt_text: '' }
    if (!imageInput.image_url) {
      setError('Please enter an image URL before adding.')
      return
    }
    setError('')
    try {
      await addLandlordHostelImage(hostelId, {
        image_url: imageInput.image_url,
        alt_text: imageInput.alt_text,
      })
      setImageForm(hostelId, { image_url: '', alt_text: '' })
      await loadHostels()
    } catch (imageError) {
      const message = imageError.response?.data?.message || 'Could not add image.'
      setError(message)
    }
  }

  const removeImage = async (hostelId, imageId) => {
    setError('')
    try {
      await deleteLandlordHostelImage(hostelId, imageId)
      await loadHostels()
    } catch (imageError) {
      const message = imageError.response?.data?.message || 'Could not delete image.'
      setError(message)
    }
  }

  const setPrimary = async (hostelId, imageId) => {
    setError('')
    try {
      await updateLandlordHostelImage(hostelId, imageId, { is_primary: true })
      await loadHostels()
    } catch (imageError) {
      const message = imageError.response?.data?.message || 'Could not set primary image.'
      setError(message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('campusnest_token')
    localStorage.removeItem('campusnest_user')
    sessionStorage.removeItem('campusnest_token')
    sessionStorage.removeItem('campusnest_user')
    navigate('/login/landlord')
  }

  return (
    <div className="landlord-dashboard-shell">
      <header className="landlord-dashboard-header">
        <h1>
          Landlord Dashboard
          {bookings.length > 0 ? (
            <span className="booking-notif-badge" aria-label={`${bookings.length} bookings`}>
              {bookings.length}
            </span>
          ) : null}
        </h1>
        <div className="landlord-dashboard-actions">
          <button type="button" onClick={() => setIsCreating((prev) => !prev)}>
            {isCreating ? 'Close Form' : 'Add Hostel'}
          </button>
          <button type="button" className="landlord-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error ? <p className="landlord-error">{error}</p> : null}

      <section className="landlord-form-card">
        <h2>Bookings on Your Hostels</h2>
        {bookingsLoading ? (
          <p className="booking-notif-empty">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="booking-notif-empty">
            No bookings yet. You will be notified here when a student books one of your hostels.
          </p>
        ) : (
          <div className="booking-notif-list">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className={`booking-notif-card ${booking.status === 'pending' ? 'is-new' : ''}`}
              >
                <div className="booking-notif-top">
                  <div>
                    <h4>{booking.hostelName}</h4>
                    <p>
                      {booking.student?.name || 'Student'}
                      {booking.student?.email ? ` • ${booking.student.email}` : ''}
                    </p>
                  </div>
                  <span className={`notif-status ${booking.status}`}>
                    {STATUS_LABEL[booking.status] || booking.status}
                  </span>
                </div>
                <div className="booking-notif-meta">
                  <span>
                    <strong>Move-in:</strong> {formatBookingDate(booking.bookingDate)}
                  </span>
                  <span>
                    <strong>Booked:</strong> {formatBookingDate(booking.createdAt)}
                  </span>
                  <span>
                    <strong>Price:</strong>{' '}
                    {booking.price === null ? '-' : `KES ${Number(booking.price).toLocaleString('en-KE')}`}
                  </span>
                  <span>
                    <strong>Payment:</strong>{' '}
                    {booking.payment ? `${booking.payment.status}` : 'Not paid'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isCreating ? (
        <section className="landlord-form-card">
          <h2>{editingId ? 'Edit Hostel' : 'Add Hostel'}</h2>
          <form onSubmit={submitHostel}>
            <label>
              Name
              <input name="name" value={form.name} onChange={handleFormChange} required />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={handleFormChange} required />
            </label>
            <label>
              Room Type
              <select name="room_type" value={form.room_type} onChange={handleFormChange}>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price
              <input name="price" type="number" min="1" value={form.price} onChange={handleFormChange} required />
            </label>
            <label>
              Distance (km)
              <input
                name="distance_km"
                type="number"
                min="0"
                step="0.1"
                value={form.distance_km}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Availability
              <select name="availability" value={form.availability} onChange={handleFormChange}>
                {AVAILABILITY.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="landlord-checkbox">
              <input
                name="utilities_included"
                type="checkbox"
                checked={form.utilities_included}
                onChange={handleFormChange}
              />
              Utilities Included
            </label>
            <label>
              Marker X
              <input name="marker_x" type="number" min="0" max="100" value={form.marker_x} onChange={handleFormChange} />
            </label>
            <label>
              Marker Y
              <input name="marker_y" type="number" min="0" max="100" value={form.marker_y} onChange={handleFormChange} />
            </label>
            <label className="landlord-description">
              Description
              <textarea name="description" rows="4" value={form.description} onChange={handleFormChange} />
            </label>
            <div className="landlord-form-actions">
              <button type="submit">{editingId ? 'Save Changes' : 'Create Hostel'}</button>
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="landlord-list-section">
        {loading ? <p>Loading your hostels...</p> : null}
        {!loading && sortedHostels.length === 0 ? <p>No hostels yet. Add your first listing.</p> : null}
        {!loading &&
          sortedHostels.map((hostel) => (
            <article key={hostel.id} className="landlord-hostel-card">
              <div className="landlord-hostel-top">
                <h3>{hostel.name}</h3>
                <div className="landlord-hostel-actions">
                  <button type="button" onClick={() => beginEdit(hostel)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => removeHostel(hostel.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <p>
                {hostel.location} • {hostel.room_type} • KES {Number(hostel.price).toLocaleString('en-KE')} •{' '}
                {hostel.availability}
              </p>

              <div className="landlord-image-manager">
                <h4>Images</h4>
                <div className="landlord-image-inputs">
                  <input
                    placeholder="https://image-url"
                    value={imageFormByHostel[hostel.id]?.image_url || ''}
                    onChange={(event) => setImageForm(hostel.id, { image_url: event.target.value })}
                  />
                  <input
                    placeholder="Alt text (optional)"
                    value={imageFormByHostel[hostel.id]?.alt_text || ''}
                    onChange={(event) => setImageForm(hostel.id, { alt_text: event.target.value })}
                  />
                  <button type="button" onClick={() => addImage(hostel.id)}>
                    Add Image
                  </button>
                </div>

                <ul className="landlord-image-list">
                  {(hostel.images || []).map((image) => (
                    <li key={image.id}>
                      <a href={image.image_url} target="_blank" rel="noreferrer">
                        {image.image_url}
                      </a>
                      <span>{image.is_primary ? 'Primary' : 'Secondary'}</span>
                      <button type="button" onClick={() => setPrimary(hostel.id, image.id)}>
                        Set Primary
                      </button>
                      <button type="button" onClick={() => removeImage(hostel.id, image.id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
      </section>
    </div>
  )
}

export default LandlordDashboardPage
