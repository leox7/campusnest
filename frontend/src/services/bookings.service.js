import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getToken = () =>
  localStorage.getItem("campusnest_token") || sessionStorage.getItem("campusnest_token");

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function createBooking(hostelId, bookingDate) {
  const response = await axios.post(
    `${API_BASE_URL}/api/bookings`,
    { hostelId, bookingDate },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getMyBookings() {
  const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function cancelBooking(id) {
  const response = await axios.patch(
    `${API_BASE_URL}/api/bookings/${id}/cancel`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function payBooking(id) {
  const response = await axios.post(
    `${API_BASE_URL}/api/bookings/${id}/pay`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getPayment(id) {
  const response = await axios.get(`${API_BASE_URL}/api/bookings/${id}/payment`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
