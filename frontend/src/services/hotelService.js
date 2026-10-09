
import axios from "axios";

const API_URL = "https://savi-hotel-backend.onrender.com/api/hotels";

export function getHotels(
  search = "",
  minPrice = 0,
  maxPrice = 1000000,
  page = 1
) {
  return axios.get(API_URL, {
    params: {
      search: search.trim(),
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      page: Number(page),
      limit: 6
    }
  });
}

export function createHotel(formData) {
  return axios.post(API_URL, formData);
}

export function updateHotel(id, formData) {
  return axios.put(`${API_URL}/${id}`, formData);
}

export function deleteHotel(id) {
  return axios.delete(`${API_URL}/${id}`);
}