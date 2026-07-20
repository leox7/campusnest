import axios from 'axios'
import { API_BASE_URL } from '../constants/auth.constants'

const getToken = () =>
  localStorage.getItem('campusnest_token') || sessionStorage.getItem('campusnest_token')

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getUsers() {
  const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
    headers: authHeaders(),
  })
  return response.data
}

export async function updateUserRole(userId, role) {
  const response = await axios.patch(
    `${API_BASE_URL}/api/admin/users/${userId}/role`,
    { user_role: role },
    { headers: authHeaders() },
  )
  return response.data
}

export async function updateUserActive(userId, isActive) {
  const response = await axios.patch(
    `${API_BASE_URL}/api/admin/users/${userId}/active`,
    { is_active: isActive },
    { headers: authHeaders() },
  )
  return response.data
}
