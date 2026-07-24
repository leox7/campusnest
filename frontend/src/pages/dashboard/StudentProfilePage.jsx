import { useNavigate } from 'react-router-dom'
import StudentDashboardLayout from '../../components/dashboard/StudentDashboardLayout'
import '../../styles/dashboard/student-dashboard.css'

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

function StudentProfilePage() {
  const navigate = useNavigate()
  const user = readUser()

  const name = user?.name || 'Student'
  const email = user?.email || '-'
  const role = user?.role || 'student'
  const avatarInitial = name.trim().charAt(0).toUpperCase()

  const handleLogout = () => {
    localStorage.removeItem('campusnest_token')
    localStorage.removeItem('campusnest_user')
    sessionStorage.removeItem('campusnest_token')
    sessionStorage.removeItem('campusnest_user')
    navigate('/login/student')
  }

  return (
    <StudentDashboardLayout activeNav="Profile">
      <main className="profile-page">
        <div className="profile-page-header">
          <h1>My Profile</h1>
          <p>Your account details.</p>
        </div>

        <section className="profile-card">
          <div className="profile-card-top">
            <span className="profile-card-avatar" aria-hidden="true">
              {avatarInitial}
            </span>
            <div>
              <h2>{name}</h2>
              <span className="profile-role-badge">{role}</span>
            </div>
          </div>

          <dl className="profile-details">
            <div className="profile-detail-row">
              <dt>Name</dt>
              <dd>{name}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Email</dt>
              <dd>{email}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Role</dt>
              <dd>{role}</dd>
            </div>
          </dl>

          <div className="profile-actions">
            <button type="button" onClick={() => navigate('/dashboard/student')}>
              Back to Browse
            </button>
            <button type="button" className="profile-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>
      </main>
    </StudentDashboardLayout>
  )
}

export default StudentProfilePage
