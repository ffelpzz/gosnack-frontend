import bk from "../assets/logos/bk.png"
import mc from "../assets/logos/mc.png"
import pizza from "../assets/logos/pizza.png"
import subway from "../assets/logos/subway.png"


export const restaurantes = [
  { id: 1, nome: "Burger King", aberto: true, logo: bk },
  { id: 2, nome: "McDonald's", aberto: true, logo: mc },
  { id: 3, nome: "Pizza Hut", aberto: false, logo: pizza },
  { id: 4, nome: "Subway", aberto: true, logo: subway },
]

export const categorias = [
  { id: 1, nome: "Lanches" },
  { id: 2, nome: "Pizzas" },
  { id: 3, nome: "Bebidas" },
  { id: 4, nome: "Sobremesas" },
  { id: 5, nome: "Japonês" },
]

export const itens = [
  { id: 1, restauranteId: 1, nome: "Whopper", preco: 25.90, descricao: "Hambúrguer clássico", categoriaId: 1 },
  { id: 2, restauranteId: 1, nome: "Onion Rings", preco: 12.90, descricao: "Anéis de cebola crocantes", categoriaId: 1 },
  { id: 3, restauranteId: 2, nome: "Big Mac", preco: 23.90, descricao: "Dois hambúrgueres", categoriaId: 1 },
  { id: 4, restauranteId: 2, nome: "McFritas", preco: 10.90, descricao: "Batata frita crocante", categoriaId: 1 },
  { id: 5, restauranteId: 3, nome: "Pizza Pepperoni", preco: 49.90, descricao: "Pizza individual", categoriaId: 2 },
]

export const pedidos = [
  {
    id: 1,
    restaurante: "Burger King",
    item: "Whopper",
    preco: 25.90,
    status: "Pronto para retirada",
  },
  {
    id: 2,
    restaurante: "McDonald's",
    item: "Big Mac",
    preco: 23.90,
    status: "Em preparo",
  },
  {
    id: 3,
    restaurante: "Pizza Hut",
    item: "Pizza Pepperoni",
    preco: 49.90,
    status: "Retirado",
  },
]

export const usuarios = [
  { id: 1, nome: "Felipe", email: "felipe@email.com", role: "cliente", ativo: true },
  { id: 2, nome: "Admin", email: "admin@email.com", role: "admin", ativo: true },
  { id: 3, nome: "BK Manager", email: "bk@email.com", role: "restaurante", restauranteId: 1, ativo: true },
]