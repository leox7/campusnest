import axios from 'axios'
import { API_BASE_URL } from '../constants/auth.constants'

const getToken = () =>
  localStorage.getItem('campusnest_token') || sessionStorage.getItem('campusnest_token')

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getLandlordBookings() {
  const response = await axios.get(`${API_BASE_URL}/api/landlord/bookings`, {
    headers: authHeaders(),
  })
  return response.data
}
