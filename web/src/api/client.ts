import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://terrific-sparkle-production-331c.up.railway.app/api";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inkwave_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// Fonctions d'upload d'images
// ==========================================

// 1. Upload de la couverture d'une histoire
export async function uploadStoryCover(storyId: string, file: File) {
  const formData = new FormData();
  formData.append("cover", file);

  const response = await api.post<{ coverUrl: string }>(
    `/stories/${storyId}/cover`,
    formData
  );
  return response.data;
}

// 2. Upload de l'avatar utilisateur
export async function uploadUserAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post<{ avatarUrl: string }>(
    `/users/me/avatar`,
    formData
  );
  return response.data;
}