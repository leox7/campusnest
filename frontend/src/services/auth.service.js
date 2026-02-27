import axios from 'axios'
import { API_BASE_URL } from '../constants/auth.constants'

export async function loginUser({ email, password }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password,
  })
  return response.data
}

export async function registerUser({ fullName, email, password, userRole }) {
  await axios.post(`${API_BASE_URL}/api/auth/register`, {
    full_name: fullName,
    email,
    password,
    user_role: userRole,
  })
}
