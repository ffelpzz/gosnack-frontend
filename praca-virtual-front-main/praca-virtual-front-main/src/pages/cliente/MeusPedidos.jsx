// src/pages/cliente/MeusPedidos.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import BottomNav from "../../components/BottomNav"
import { Package } from "lucide-react"
import api from "../../services/api"

const statusConfig = {
  "Aguardando confirmação": { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  "Em preparo": { bg: "bg-blue-500/10", text: "text-blue-400" },
  "Pronto para retirada": { bg: "bg-green-500/10", text: "text-green-400" },
  "Retirado": { bg: "bg-gray-500/10", text: "text-gray-400" },
}

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/pedidos/meus")
      .then((res) => setPedidos(res.data))
      .catch(() => setPedidos([]))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <div className="min-h-screen pb-24 bg-[#121212] text-white">
      <Header />

      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-center mb-6">Meus pedidos</h1>

        {carregando ? (
          <p className="text-center text-gray-400">Carregando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-16">
            <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <Package size={36} strokeWidth={1.5} className="text-gray-500" />
            </div>
            <p className="text-white font-bold text-lg">Nenhum pedido ainda</p>
            <p className="text-gray-400 text-sm">Seus pedidos aparecerão aqui</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full text-white font-bold bg-[#3B82F6] hover:bg-[#60A5FA] transition-all"
            >
              Pedir agora
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pedidos.map((pedido) => {
              const style = statusConfig[pedido.status] || statusConfig["Retirado"]
              const nomeItens = pedido.itens?.map((i) => `${i.nome} x${i.quantidade}`).join(", ")

              return (
                <div key={pedido.id} className="rounded-2xl p-4 flex flex-col gap-3 bg-[#1E1E1E]">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl flex-shrink-0 bg-[#2A2A2A] flex items-center justify-center">
                      <Package size={28} strokeWidth={1.5} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-white">{pedido.restaurante}</p>
                        <p className="font-bold text-[#3B82F6]">
                          R$ {pedido.total.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      {nomeItens && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">{nomeItens}</p>
                      )}
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                        {pedido.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/pedido/${pedido.id}`)}
                    className="w-full py-3 rounded-full text-white font-bold bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-95 transition-all duration-150"
                  >
                    Ver detalhes
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
