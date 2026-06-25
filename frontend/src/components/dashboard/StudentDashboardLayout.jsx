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
  { label: 'Profile', path: null },
]

function StudentDashboardLayout({ activeNav = 'Browse Hostels', children }) {
  const navigate = useNavigate()

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
          <button type="button" className="notif-btn" aria-label="Notifications">
            <span className="notif-btn-label">Alerts</span>
            <span className="notif-badge">2</span>
          </button>
          <button type="button" className="profile-avatar" aria-label="Profile">
            S
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
