import axios from 'axios'
import { API_BASE_URL } from '../constants/auth.constants'

const getToken = () =>
  localStorage.getItem('campusnest_token') || sessionStorage.getItem('campusnest_token')

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getLandlordHostels() {
  const response = await axios.get(`${API_BASE_URL}/api/landlord/hostels`, {
    headers: authHeaders(),
  })
  return response.data
}

export async function createLandlordHostel(payload) {
  const response = await axios.post(`${API_BASE_URL}/api/landlord/hostels`, payload, {
    headers: authHeaders(),
  })
  return response.data
}

export async function updateLandlordHostel(hostelId, payload) {
  const response = await axios.put(`${API_BASE_URL}/api/landlord/hostels/${hostelId}`, payload, {
    headers: authHeaders(),
  })
  return response.data
}

export async function deleteLandlordHostel(hostelId) {
  const response = await axios.delete(`${API_BASE_URL}/api/landlord/hostels/${hostelId}`, {
    headers: authHeaders(),
  })
  return response.data
}

export async function addLandlordHostelImage(hostelId, payload) {
  const response = await axios.post(
    `${API_BASE_URL}/api/landlord/hostels/${hostelId}/images`,
    payload,
    { headers: authHeaders() },
  )
  return response.data
}

export async function updateLandlordHostelImage(hostelId, imageId, payload) {
  const response = await axios.patch(
    `${API_BASE_URL}/api/landlord/hostels/${hostelId}/images/${imageId}`,
    payload,
    { headers: authHeaders() },
  )
  return response.data
}

export async function deleteLandlordHostelImage(hostelId, imageId) {
  const response = await axios.delete(
    `${API_BASE_URL}/api/landlord/hostels/${hostelId}/images/${imageId}`,
    { headers: authHeaders() },
  )
  return response.data
}
