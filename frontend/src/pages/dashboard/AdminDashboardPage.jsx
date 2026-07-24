import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminHostelById,
  getAdminHostels,
  getAdminUsers,
  verifyHostel,
} from '../../services/admin.service'
import { getAdminBookings } from '../../services/adminBookings.service'
import ReviewList from '../../components/reviews/ReviewList'
import '../../styles/dashboard/admin-dashboard.css'
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

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [hostels, setHostels] = useState([])
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const pendingHostels = useMemo(
    () => hostels.filter((hostel) => !hostel.verified),
    [hostels],
  )

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [hostelsResponse, usersResponse, bookingsResponse] = await Promise.all([
        getAdminHostels(),
        getAdminUsers(),
        getAdminBookings(),
      ])
      setHostels(hostelsResponse.hostels ?? [])
      setUsers(usersResponse.users ?? [])
      setBookings(bookingsResponse.bookings ?? [])
    } catch (fetchError) {
      const message = fetchError.response?.data?.message || 'Failed to load admin dashboard data.'
      setError(message)
      setHostels([])
      setUsers([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleVerify = async (hostelId, currentVerified) => {
    setError('')
    try {
      await verifyHostel(hostelId, !currentVerified)
      await loadData()
    } catch (verifyError) {
      const message = verifyError.response?.data?.message || 'Could not update hostel verification.'
      setError(message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('campusnest_token')
    localStorage.removeItem('campusnest_user')
    sessionStorage.removeItem('campusnest_token')
    sessionStorage.removeItem('campusnest_user')
    navigate('/login/admin')
  }

  const openHostelDetails = async (hostelId) => {
    setDetailLoading(true)
    setError('')
    try {
      const response = await getAdminHostelById(hostelId)
      setSelectedHostel(response.hostel ?? null)
    } catch (detailError) {
      const message = detailError.response?.data?.message || 'Could not load hostel details.'
      setError(message)
      setSelectedHostel(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeHostelDetails = () => {
    setSelectedHostel(null)
  }

  return (
    <div className="admin-dashboard-shell">
      <header className="admin-dashboard-header">
        <h1>
          Admin Dashboard
          {bookings.length > 0 ? (
            <span className="booking-notif-badge" aria-label={`${bookings.length} bookings`}>
              {bookings.length}
            </span>
          ) : null}
        </h1>
        <div className="admin-dashboard-header-actions">
          <button type="button" onClick={() => navigate('/dashboard/admin/users')}>
            Manage Users
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error ? <p className="admin-error">{error}</p> : null}

      {loading ? (
        <p>Loading admin data...</p>
      ) : (
        <>
          <section className="admin-card">
            <h2>Recent Bookings</h2>
            {bookings.length === 0 ? (
              <p className="booking-notif-empty">No bookings have been made yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Hostel</th>
                      <th>Student</th>
                      <th>Landlord</th>
                      <th>Move-in</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.hostelName}</td>
                        <td>{booking.student?.name || booking.student?.email || '-'}</td>
                        <td>{booking.landlord?.name || booking.landlord?.email || '-'}</td>
                        <td>{formatBookingDate(booking.bookingDate)}</td>
                        <td>
                          <span className={`notif-status ${booking.status}`}>
                            {STATUS_LABEL[booking.status] || booking.status}
                          </span>
                        </td>
                        <td>{booking.payment ? booking.payment.status : 'Not paid'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2>Listings Needing Review</h2>
            {pendingHostels.length === 0 ? (
              <p>No pending listings right now.</p>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Landlord</th>
                      <th>Price (KSH)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingHostels.map((hostel) => (
                      <tr key={hostel.id}>
                        <td>{hostel.name}</td>
                        <td>{hostel.location}</td>
                        <td>{hostel.landlord_name || hostel.landlord_email}</td>
                        <td>{Number(hostel.price).toLocaleString('en-KE')}</td>
                        <td>
                          <button type="button" onClick={() => openHostelDetails(hostel.id)}>
                            View details
                          </button>
                          <button type="button" onClick={() => toggleVerify(hostel.id, hostel.verified)}>
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2>All Hostels</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Landlord</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hostels.map((hostel) => (
                    <tr key={hostel.id}>
                      <td>{hostel.name}</td>
                      <td>{hostel.location}</td>
                      <td>{hostel.landlord_name || hostel.landlord_email}</td>
                      <td>{hostel.verified ? 'Verified' : 'Pending'}</td>
                      <td>
                        <button type="button" onClick={() => openHostelDetails(hostel.id)}>
                          View details
                        </button>
                        <button type="button" onClick={() => toggleVerify(hostel.id, hostel.verified)}>
                          {hostel.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-card">
            <h2>Users</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>{user.user_role}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {(detailLoading || selectedHostel) && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeHostelDetails}>
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Hostel details"
            onClick={(event) => event.stopPropagation()}
          >
            {detailLoading ? (
              <p>Loading hostel details...</p>
            ) : (
              <>
                <header className="admin-modal-header">
                  <h3>{selectedHostel?.name}</h3>
                  <button type="button" onClick={closeHostelDetails}>
                    Close
                  </button>
                </header>

                <div className="admin-modal-meta">
                  <span>{selectedHostel?.location}</span>
                  <span>{selectedHostel?.roomType}</span>
                  <span>KSH {Number(selectedHostel?.price ?? 0).toLocaleString('en-KE')}</span>
                  <span>{selectedHostel?.verified ? 'Verified' : 'Pending'}</span>
                </div>

                <p className="admin-modal-description">
                  {selectedHostel?.description || 'No description provided.'}
                </p>

                <div className="admin-modal-images">
                  {(selectedHostel?.images ?? []).length === 0 ? (
                    <p>No images uploaded yet.</p>
                  ) : (
                    selectedHostel.images.map((image) => (
                      <img key={image.id} src={image.url} alt={image.alt || selectedHostel.name} loading="lazy" />
                    ))
                  )}
                </div>

                <div className="admin-modal-reviews">
                  <ReviewList hostelId={selectedHostel.id} showSummary />
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={async () => {
                      await toggleVerify(selectedHostel.id, selectedHostel.verified)
                      const refreshed = await getAdminHostelById(selectedHostel.id)
                      setSelectedHostel(refreshed.hostel ?? null)
                    }}
                  >
                    {selectedHostel?.verified ? 'Unverify listing' : 'Verify listing'}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
