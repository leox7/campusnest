import { Navigate } from 'react-router-dom'

const readSession = () => {
  const token = localStorage.getItem('campusnest_token') || sessionStorage.getItem('campusnest_token')
  const rawUser = localStorage.getItem('campusnest_user') || sessionStorage.getItem('campusnest_user')

  if (!token || !rawUser) {
    return { token: '', role: '' }
  }

  try {
    const user = JSON.parse(rawUser)
    return { token, role: user.role || '' }
  } catch {
    return { token: '', role: '' }
  }
}

const resolveRolePath = (role) => {
  if (role === 'student') return '/dashboard/student'
  if (role === 'admin') return '/login/admin'
  if (role === 'landlord') return '/dashboard/landlord'
  return '/login/student'
}

export function RequireStudentAuth({ children }) {
  const { token, role } = readSession()
  if (!token) {
    return <Navigate to="/login/student" replace />
  }
  if (role !== 'student') {
    return <Navigate to={resolveRolePath(role)} replace />
  }
  return children
}

export function GuestOnlyRoute({ children }) {
  const { token, role } = readSession()
  if (token) {
    return <Navigate to={resolveRolePath(role)} replace />
  }
  return children
}

export function RequireLandlordAuth({ children }) {
  const { token, role } = readSession()
  if (!token) {
    return <Navigate to="/login/landlord" replace />
  }
  if (role !== 'landlord') {
    return <Navigate to={resolveRolePath(role)} replace />
  }
  return children
}
