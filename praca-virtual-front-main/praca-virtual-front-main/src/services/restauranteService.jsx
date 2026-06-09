// src/services/restauranteService.jsx — conectado à API real
import api from "./api"

export function listarRestaurantes() {
  return api.get("/restaurantes").then((res) => res.data)
}

export function buscarRestaurante(id) {
  return api.get(`/restaurantes/${id}`).then((res) => res.data)
}

export function listarItensPorRestaurante(id) {
  return api.get(`/restaurantes/${id}/itens`).then((res) => res.data)
}
