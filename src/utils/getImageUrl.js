// src/utils/getImageUrl.js
import { API_BASE_URL } from "../api/axiosInstance";

export function getImageUrl(path) {
  if (!path) return null;
  return `${path}`;
}