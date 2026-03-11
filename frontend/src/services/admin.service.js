import axios from 'axios'
import { API_BASE_URL } from '../constants/auth.constants'

const getToken = () =>
  localStorage.getItem('campusnest_token') || sessionStorage.getItem('campusnest_token')

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getAdminHostels() {
  const response = await axios.get(`${API_BASE_URL}/api/admin/hostels`, {
    headers: authHeaders(),
  })
  return response.data
}

export async function verifyHostel(hostelId, verified) {
  const response = await axios.put(
    `${API_BASE_URL}/api/admin/verify-hostel/${hostelId}`,
    { verified },
    { headers: authHeaders() },
  )
  return response.data
}

export async function getAdminHostelById(hostelId) {
  const response = await axios.get(`${API_BASE_URL}/api/admin/hostels/${hostelId}`, {
    headers: authHeaders(),
  })
  return response.data
}

export async function getAdminUsers() {
  const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
    headers: authHeaders(),
  })
  return response.data
}
