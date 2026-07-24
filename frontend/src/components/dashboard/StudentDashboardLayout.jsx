import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/dashboard/student-dashboard.css'

const NAV_ITEMS = [
  { label: 'Browse Hostels', path: '/dashboard/student' },
  { label: 'My Bookings', path: '/dashboard/student/bookings' },
  { label: 'Messages', path: null },
  { label: 'Saved', path: '/dashboard/student/saved' },
]

const MOBILE_NAV_ITEMS = [
  { label: 'Browse', path: '/dashboard/student' },
  { label: 'Saved', path: '/dashboard/student/saved' },
  { label: 'Messages', path: null },
  { label: 'Profile', path: '/dashboard/student/profile' },
]

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Booking confirmed',
    body: 'Your booking at Sunrise Hostel has been confirmed.',
    time: '2h ago',
  },
  {
    id: 2,
    title: 'New AI recommendation',
    body: 'We found a new hostel near your campus you might like.',
    time: '1d ago',
  },
]

const readUser = () => {
  const rawUser =
    localStorage.getItem('campusnest_user') || sessionStorage.getItem('campusnest_user')
  if (!rawUser) return null
  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

function StudentDashboardLayout({ activeNav = 'Browse Hostels', children }) {
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const user = readUser()
  const avatarInitial = (user?.name || user?.email || 'S').trim().charAt(0).toUpperCase()

  useEffect(() => {
    if (!notifOpen) return undefined

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  const handleLogout = () => {
    localStorage.removeItem('campusnest_token')
    localStorage.removeItem('campusnest_user')
    sessionStorage.removeItem('campusnest_token')
    sessionStorage.removeItem('campusnest_user')
    navigate('/login/student')
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <span className="logo-icon" aria-hidden="true" />
          <span>CampusNest AI</span>
        </div>

        <nav className="dashboard-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`dashboard-nav-link ${activeNav === item.label ? 'active' : ''}`}
              onClick={() => (item.path ? navigate(item.path) : undefined)}
              disabled={!item.path}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dashboard-header-right">
          <div className="notif-wrap" ref={notifRef}>
            <button
              type="button"
              className="notif-btn"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((prev) => !prev)}
            >
              <span className="notif-btn-label">Alerts</span>
              {NOTIFICATIONS.length > 0 ? (
                <span className="notif-badge">{NOTIFICATIONS.length}</span>
              ) : null}
            </button>

            {notifOpen ? (
              <div className="notif-panel" role="menu">
                <div className="notif-panel-header">
                  <span>Notifications</span>
                </div>
                {NOTIFICATIONS.length === 0 ? (
                  <p className="notif-empty">You're all caught up.</p>
                ) : (
                  <ul className="notif-list">
                    {NOTIFICATIONS.map((item) => (
                      <li key={item.id} className="notif-item">
                        <p className="notif-item-title">{item.title}</p>
                        <p className="notif-item-body">{item.body}</p>
                        <span className="notif-item-time">{item.time}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="profile-avatar"
            aria-label="Profile"
            onClick={() => navigate('/dashboard/student/profile')}
          >
            {avatarInitial}
          </button>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {children}

      <nav className="mobile-bottom-nav" aria-label="Mobile dashboard navigation">
        {MOBILE_NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={activeNav === item.label ? 'active' : ''}
            onClick={() => (item.path ? navigate(item.path) : undefined)}
            disabled={!item.path}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default StudentDashboardLayout
