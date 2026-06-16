// src/services/api.js
// Instância Axios configurada para comunicar com o backend

import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 10000,
})

// Injeta o token JWT em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null")
  if (usuario?.token) {
    config.headers.Authorization = `Bearer ${usuario.token}`
  }
  return config
})

// Se o token expirar (401), faz logout automático
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("usuario")
      window.location.href = "/login"
    }
    return Promise.reject(err)
  }
)

export default api
