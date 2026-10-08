import axios from "axios";

const API_URL = "https://savi-hotel-backend.onrender.com/api/hotels";

export function getHotels(
  search = "",
  minPrice = 1000,
  maxPrice = 10000,
  page = 1
) {
  return axios.get(API_URL, {
    params: {
      search: search.trim(),
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      page: Number(page),
      limit: 5
    }
  });
}

export function createHotel(formData) {
  return axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export function updateHotel(id, formData) {
  return axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export function deleteHotel(id) {
  return axios.delete(`${API_URL}/${id}`);
}