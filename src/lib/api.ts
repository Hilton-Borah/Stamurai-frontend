// src/lib/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTaskById = async (id: string) => {
  const res = await axios.get(`/api/tasks/${id}`, { withCredentials: true });
  return res.data;
};

export default API;
