// src/services/produtosService.js — CRUD de produtos do cardápio
import api from "./api"

const BASE = "/produtos"

/** Lista todos os produtos do restaurante (inclui indisponíveis) */
export async function listarProdutos(restauranteId) {
  const { data } = await api.get(`${BASE}/restaurante/${restauranteId}`)
  return data
}

/**
 * Cria um produto.
 * @param {FormData} formData — nome, descricao, preco, categoria, disponivel, restauranteId, imagem (File)
 */
export async function criarProduto(formData) {
  const { data } = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

/**
 * Atualiza um produto.
 * @param {number} id
 * @param {FormData} formData
 */
export async function atualizarProduto(id, formData) {
  const { data } = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

/** Alterna disponibilidade sem precisar reenviar tudo */
export async function alterarDisponibilidade(id, disponivel) {
  const { data } = await api.patch(`${BASE}/${id}/disponibilidade`, { disponivel })
  return data
}

/** Remove um produto */
export async function deletarProduto(id) {
  const { data } = await api.delete(`${BASE}/${id}`)
  return data
}
