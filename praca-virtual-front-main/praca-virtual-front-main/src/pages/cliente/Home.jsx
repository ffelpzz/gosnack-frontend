// src/pages/cliente/Home.jsx
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import BottomNav from "../../components/BottomNav"
import { useEffect, useState } from "react"
import { listarRestaurantes } from "../../services/restauranteService"

export default function Home() {
  const navigate = useNavigate()
  const [restaurantes, setRestaurantes] = useState([])
  const [busca, setBusca] = useState("")
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    listarRestaurantes()
      .then((data) => setRestaurantes(data))
      .finally(() => setCarregando(false))
  }, [])

  // Filtra pelo nome
  const restaurantesFiltrados = restaurantes.filter((r) =>
    r.nome.toLowerCase().includes(busca.toLowerCase().trim())
  )

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <Header />

      <main className="px-4 pt-4">
        <h2 className="text-xl font-bold text-white mb-2">
          Explore Restaurantes
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Faça seu pedido sem pegar fila
        </p>

        {/* Campo de busca */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 bg-[#1E1E1E] border border-[#2A2A2A] focus-within:border-[#3B82F6] transition-colors">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar restaurante..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent outline-none text-white placeholder-gray-500 text-sm"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="text-gray-500 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          )}
        </div>

        {/* carregando */}
        {carregando ? (
          <div className="flex justify-center mt-16">
            <p className="text-gray-400">Carregando restaurantes...</p>
          </div>
        ) : restaurantesFiltrados.length === 0 ? (
          // Nenhum resultado encontrado
          <div className="flex flex-col items-center justify-center gap-3 mt-16">
            <span className="text-5xl">🔍</span>
            <p className="text-white font-bold text-lg">Nenhum resultado</p>
            <p className="text-gray-400 text-sm text-center">
              Não encontramos restaurantes com "{busca}"
            </p>
            <button
              onClick={() => setBusca("")}
              className="mt-2 px-6 py-2 rounded-full text-sm font-semibold bg-[#3B82F6] hover:bg-[#60A5FA] text-white transition-all"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {restaurantesFiltrados.map((restaurante) => (
              <div
                key={restaurante.id}
                onClick={() => navigate(`/restaurante/${restaurante.id}`)}
                className="bg-[#1E1E1E] rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-all duration-150 p-4"
              >
                {/* Logo */}
                <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center shadow-sm p-2">
                  <img
                    src={restaurante.logo}
                    alt={restaurante.nome}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Nome */}
                <h3 className="mt-3 text-sm font-semibold text-center text-white">
                  {restaurante.nome}
                </h3>

                {/* Status */}
                <p
                  className={`mt-1 text-xs font-medium ${restaurante.aberto ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {restaurante.aberto ? "Aberto" : "Fechado"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
