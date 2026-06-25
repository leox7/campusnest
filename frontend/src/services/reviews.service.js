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

export async function createReview(hostelId, rating, comment) {
  const response = await axios.post(
    `${API_BASE_URL}/api/reviews`,
    { hostelId, rating, comment },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getReviews(hostelId) {
  const response = await axios.get(`${API_BASE_URL}/api/hostels/${hostelId}/reviews`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
