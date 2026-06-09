// src/pages/restaurante/PainelRestaurante.jsx
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import GerenciarCardapio from "./GerenciarCardapio"

const STATUS_PROXIMO = {
  AGUARDANDO: "EM_PREPARO",
  EM_PREPARO: "PRONTO",
  PRONTO: "RETIRADO",
}

const statusConfig = {
  AGUARDANDO: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Aguardando" },
  EM_PREPARO:  { bg: "bg-blue-500/10",   text: "text-blue-400",   label: "Em preparo" },
  PRONTO:      { bg: "bg-green-500/10",  text: "text-green-400",  label: "Pronto" },
}

const acaoBotao = {
  AGUARDANDO: "✅ Aceitar pedido",
  EM_PREPARO:  "🍽️ Marcar como pronto",
  PRONTO:      "🎉 Confirmar retirada",
}

function FilaPedidos({ id }) {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(null)

  const buscarPedidos = () => {
    api.get(`/pedidos/restaurante/${id}`)
      .then((res) => setPedidos(res.data))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    buscarPedidos()
    const intervalo = setInterval(buscarPedidos, 8000)
    return () => clearInterval(intervalo)
  }, [id])

  const avancarStatus = async (pedidoId, statusAtual) => {
    const proximo = STATUS_PROXIMO[statusAtual]
    if (!proximo) return
    setAtualizando(pedidoId)
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: proximo })
      buscarPedidos()
    } catch {
      alert("Erro ao atualizar status do pedido")
    } finally {
      setAtualizando(null)
    }
  }

  if (carregando) return <p className="text-center text-gray-400 mt-16">Carregando pedidos...</p>

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-16">
        <span className="text-6xl">🎉</span>
        <p className="text-white font-bold text-lg">Tudo em dia!</p>
        <p className="text-gray-400 text-sm">Nenhum pedido pendente no momento</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {pedidos.map((pedido) => {
        const style = statusConfig[pedido.status] || statusConfig.AGUARDANDO
        const acao = acaoBotao[pedido.status]
        return (
          <div key={pedido.id} className="rounded-2xl bg-[#1E1E1E] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white">Pedido #{pedido.id}</p>
                <p className="text-sm text-gray-400">{pedido.cliente?.nome}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="bg-[#2A2A2A] rounded-xl p-3 flex flex-col gap-1">
              {pedido.itens?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.item?.nome}</span>
                  <span className="text-gray-400 font-medium">x{item.quantidade}</span>
                </div>
              ))}
              <div className="border-t border-[#3A3A3A] mt-1 pt-1 flex justify-between text-sm font-bold">
                <span className="text-white">Total</span>
                <span className="text-[#3B82F6]">R$ {pedido.total?.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
            {acao && (
              <button
                onClick={() => avancarStatus(pedido.id, pedido.status)}
                disabled={atualizando === pedido.id}
                className="w-full py-3 rounded-full text-white font-bold bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-95 transition-all disabled:opacity-60"
              >
                {atualizando === pedido.id ? "Atualizando..." : acao}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PainelRestaurante() {
  const { id } = useParams()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState("pedidos")
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="bg-[#181818] px-4 py-4 border-b border-[#2A2A2A] sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🍔 Painel do Restaurante</h1>
            <p className="text-gray-500 text-xs">{usuario?.nome}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">Ao vivo</span>
            </div>
            {/* Botão logout */}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 bg-[#2A2A2A] hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors border border-[#3A3A3A] hover:border-red-500/30"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 mt-3 bg-[#2A2A2A] p-1 rounded-xl">
          <button
            onClick={() => setAba("pedidos")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              aba === "pedidos" ? "bg-[#3B82F6] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            📋 Pedidos
          </button>
          <button
            onClick={() => setAba("cardapio")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              aba === "cardapio" ? "bg-[#3B82F6] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            🍽️ Cardápio
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      {aba === "pedidos" ? (
        <div className="px-4 pt-6 pb-10">
          <FilaPedidos id={id} />
        </div>
      ) : (
        <GerenciarCardapio standalone={false} />
      )}
    </div>
  )
}
