// src/pages/cliente/StatusPedido.jsx
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import api from "../../services/api"

const etapas = [
  { status: "AGUARDANDO", label: "Aguardando confirmação", emoji: "⏳" },
  { status: "EM_PREPARO", label: "Em preparo", emoji: "👨‍🍳" },
  { status: "PRONTO", label: "Pronto para retirada", emoji: "✅" },
  { status: "RETIRADO", label: "Retirado", emoji: "🎉" },
]

const ordemStatus = { AGUARDANDO: 0, EM_PREPARO: 1, PRONTO: 2, RETIRADO: 3 }

export default function StatusPedido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [confirmandoChegada, setConfirmandoChegada] = useState(false)
  const [chegadaConfirmada, setChegadaConfirmada] = useState(false)

  const buscarPedido = () => {
    api.get(`/pedidos/${id}`)
      .then((res) => setPedido(res.data))
      .catch(() => { })
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    buscarPedido()
    //atualiza o status a cada 30 segundos
    const intervalo = setInterval(buscarPedido, 30000)
    return () => clearInterval(intervalo)
  }, [id])

  const handleChegueiAoRestaurante = async () => {
    setConfirmandoChegada(true)
    try {
      // Avança o status para RETIRADO (confirma que o cliente chegou e retirou)
      await api.patch(`/pedidos/${id}/status`, { status: "RETIRADO" })
      setChegadaConfirmada(true)
      buscarPedido() // atualiza a tela
    } catch {
      alert("Erro ao confirmar chegada. Tente novamente.")
    } finally {
      setConfirmandoChegada(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-gray-400">Carregando pedido...</p>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-red-400">Pedido não encontrado</p>
      </div>
    )
  }

  const indiceAtual = ordemStatus[pedido.status] ?? 0
  const pedidoPronto = pedido.status === "PRONTO"
  const pedidoRetirado = pedido.status === "RETIRADO"

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-10">
      <Header />

      <div className="px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-1">Pedido #{pedido.id}</h1>
        <p className="text-center text-gray-400 text-sm mb-8">{pedido.restaurante?.nome}</p>

        {/* Etapas */}
        <div className="flex flex-col gap-0 mb-8">
          {etapas.map((etapa, i) => {
            const concluido = i <= indiceAtual
            const atual = i === indiceAtual

            return (
              <div key={etapa.status} className="flex items-stretch gap-4">
                {/* Linha + círculo */}
                <div className="flex flex-col items-center w-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 flex-shrink-0
                    ${atual ? "bg-[#3B82F6] text-white ring-4 ring-[#3B82F6]/30" : concluido ? "bg-green-500 text-white" : "bg-[#2A2A2A] text-gray-500"}`}
                  >
                    {concluido && !atual ? "✓" : etapa.emoji}
                  </div>
                  {i < etapas.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 ${i < indiceAtual ? "bg-green-500" : "bg-[#2A2A2A]"}`} />
                  )}
                </div>

                {/* Texto */}
                <div className={`pb-6 flex-1 ${i === etapas.length - 1 ? "pb-0" : ""}`}>
                  <p className={`font-semibold text-sm ${atual ? "text-[#3B82F6]" : concluido ? "text-white" : "text-gray-500"}`}>
                    {etapa.label}
                  </p>
                  {atual && (
                    <p className="text-xs text-gray-400 mt-0.5">Em andamento...</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Botão Cheguei ao Restaurante . att: aparece só quando pedido está como PRONTO */}
        {pedidoPronto && !chegadaConfirmada && (
          <div className="mb-6 rounded-2xl bg-green-500/10 border border-green-500/30 p-4 flex flex-col items-center gap-3">
            <span className="text-3xl">📍</span>
            <p className="text-green-400 font-bold text-center">Seu pedido está pronto!</p>
            <p className="text-gray-400 text-sm text-center">
              Dirija-se ao restaurante e confirme sua chegada ao retirar o pedido.
            </p>
            <button
              onClick={handleChegueiAoRestaurante}
              disabled={confirmandoChegada}
              className="w-full py-4 rounded-full text-white font-bold text-base bg-green-500 hover:bg-green-400 active:scale-95 transition-all duration-150 disabled:opacity-90 shadow-lg shadow-green-500/20"
            >
              {confirmandoChegada ? "Confirmando..." : "📍 Cheguei ao Restaurante"}
            </button>
          </div>
        )}

        {/* Confirmar chegada */}
        {(chegadaConfirmada || pedidoRetirado) && (
          <div className="mb-6 rounded-2xl bg-[#1E1E1E] border border-green-500/20 p-4 flex flex-col items-center gap-2">
            <span className="text-3xl">🎉</span>
            <p className="text-green-400 font-bold text-center">Chegada confirmada!</p>
            <p className="text-gray-400 text-sm text-center">Obrigado por usar o aplicativo. Bom apetite!</p>
          </div>
        )}

        {/* Itens pedido */}
        <div className="rounded-2xl bg-[#1E1E1E] p-4 mb-6">
          <h3 className="font-bold text-white mb-3">Itens do pedido</h3>
          <div className="flex flex-col gap-2">
            {pedido.itens?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.item?.nome || item.nome} x{item.quantidade}</span>
                <span className="text-[#3B82F6] font-semibold">
                  R$ {(item.precoUnit * item.quantidade).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
            <div className="border-t border-[#2A2A2A] mt-2 pt-2 flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="text-[#3B82F6]">R$ {pedido.total?.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/meus-pedidos")}
          className="w-full py-4 rounded-full text-white font-bold bg-[#2A2A2A] hover:bg-[#333] transition-all"
        >
          Ver todos os pedidos
        </button>
      </div>
    </div>
  )
}
