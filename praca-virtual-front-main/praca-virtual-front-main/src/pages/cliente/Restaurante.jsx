// src/pages/cliente/Restaurante.jsx — conectado à API real
import { useParams } from "react-router-dom"
import Header from "../../components/Header"
import BottomNav from "../../components/BottomNav"
import ItemCard from "../../components/ItemCard"
import { useEffect, useState } from "react"
import { buscarRestaurante, listarItensPorRestaurante } from "../../services/restauranteService"

export default function Restaurante() {
  const { id } = useParams()
  const [restaurante, setRestaurante] = useState(null)
  const [cardapio, setCardapio] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  useEffect(() => {
    setCarregando(true)
    Promise.all([
      buscarRestaurante(id),
      listarItensPorRestaurante(id),
    ])
      .then(([rest, itens]) => {
        setRestaurante(rest)
        setCardapio(itens)
      })
      .catch(() => setErro("Não foi possível carregar o cardápio."))
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-gray-400">Carregando cardápio...</p>
      </div>
    )
  }

  if (erro || !restaurante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-red-400">{erro || "Restaurante não encontrado"}</p>
      </div>
    )
  }

  const statusClasses = restaurante.aberto
    ? "bg-green-500/10 text-green-400"
    : "bg-red-500/10 text-red-400"

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <Header />

      <main className="px-4 pt-4">
        <h2 className="text-2xl font-bold mb-2">{restaurante.nome}</h2>

        {restaurante.descricao && (
          <p className="text-gray-400 text-sm mb-3">{restaurante.descricao}</p>
        )}

        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 ${statusClasses}`}>
          {restaurante.aberto ? "Aberto" : "Fechado"}
        </span>

        {cardapio.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">Nenhum item disponível no momento.</p>
        ) : (
          <div className="space-y-4">
            {cardapio.map((item) => (
              <ItemCard key={item.id} item={item} aberto={restaurante.aberto} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
