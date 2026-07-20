import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, updateUserActive, updateUserRole } from '../../services/adminUsers.service'
import '../../styles/dashboard/admin-users.css'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'admin', label: 'Admin' },
]

const readCurrentUser = () => {
  const rawUser =
    localStorage.getItem('campusnest_user') || sessionStorage.getItem('campusnest_user')
  if (!rawUser) return null
  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingChange, setPendingChange] = useState(null)

  const currentUser = readCurrentUser()
  const currentAdminId = currentUser?.id ?? null

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getUsers()
      setUsers(response.users ?? [])
    } catch (fetchError) {
      const message = fetchError.response?.data?.message || 'Failed to load users.'
      setError(message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const requestRoleChange = (user, newRole) => {
    if (newRole === user.user_role) return
    setError('')
    setPendingChange({
      userId: user.id,
      type: 'role',
      newValue: newRole,
      label: `Change ${user.full_name}'s role to ${newRole}?`,
    })
  }

  const requestActiveToggle = (user) => {
    const newValue = !user.is_active
    setError('')
    setPendingChange({
      userId: user.id,
      type: 'active',
      newValue,
      label: newValue ? `Activate ${user.full_name}?` : `Deactivate ${user.full_name}?`,
    })
  }

  const cancelChange = () => {
    setPendingChange(null)
  }

  const confirmChange = async () => {
    if (!pendingChange) return
    setSaving(true)
    setError('')
    try {
      if (pendingChange.type === 'role') {
        await updateUserRole(pendingChange.userId, pendingChange.newValue)
      } else {
        await updateUserActive(pendingChange.userId, pendingChange.newValue)
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === pendingChange.userId
            ? {
                ...user,
                ...(pendingChange.type === 'role'
                  ? { user_role: pendingChange.newValue }
                  : { is_active: pendingChange.newValue }),
              }
            : user,
        ),
      )
      setPendingChange(null)
    } catch (saveError) {
      const message = saveError.response?.data?.message || 'Could not apply the change.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const selfTooltip = 'Cannot modify your own account'

  return (
    <div className="admin-users-shell">
      <header className="admin-users-header">
        <div>
          <h1>User Management</h1>
          <button
            type="button"
            className="admin-users-back"
            onClick={() => navigate('/dashboard/admin')}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {error ? <p className="admin-users-error">{error}</p> : null}

      {pendingChange ? (
        <div className="admin-users-confirm" role="alertdialog" aria-live="assertive">
          <span>{pendingChange.label}</span>
          <div className="admin-users-confirm-actions">
            <button type="button" onClick={confirmChange} disabled={saving}>
              {saving ? 'Working...' : 'Confirm'}
            </button>
            <button type="button" className="secondary" onClick={cancelChange} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="admin-users-loading">Loading users...</p>
      ) : (
        <section className="admin-users-card">
          <div className="admin-users-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = currentAdminId != null && user.id === currentAdminId
                  return (
                    <tr key={user.id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.user_role}
                          disabled={isSelf || saving}
                          title={isSelf ? selfTooltip : undefined}
                          onChange={(event) => requestRoleChange(user, event.target.value)}
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`admin-users-badge ${user.is_active ? 'active' : 'inactive'}`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={user.is_active ? 'danger' : 'success'}
                          disabled={isSelf || saving}
                          title={isSelf ? selfTooltip : undefined}
                          onClick={() => requestActiveToggle(user)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminUsersPage
