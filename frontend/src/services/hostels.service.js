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

const buildFilters = (filters = {}) => {
  const params = {};
  if (typeof filters.area === "string" && filters.area.trim()) params.area = filters.area.trim();
  if (typeof filters.roomType === "string" && filters.roomType.trim()) params.roomType = filters.roomType.trim();
  if (Number.isFinite(Number(filters.minPrice))) params.minPrice = Number(filters.minPrice);
  if (Number.isFinite(Number(filters.maxPrice))) params.maxPrice = Number(filters.maxPrice);
  if (typeof filters.filter === "string" && filters.filter.trim()) params.filter = filters.filter.trim();
  if (typeof filters.sortBy === "string" && filters.sortBy.trim()) params.sortBy = filters.sortBy.trim();
  return params;
};

export async function getHostels(filters = {}) {
  const response = await axios.get(`${API_BASE_URL}/api/hostels`, {
    params: buildFilters(filters),
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getHostelById(id) {
  const response = await axios.get(`${API_BASE_URL}/api/hostels/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function saveHostel(id) {
  const response = await axios.post(
    `${API_BASE_URL}/api/hostels/${id}/save`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

export async function getSavedHostels() {
  const response = await axios.get(`${API_BASE_URL}/api/hostels/saved`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
