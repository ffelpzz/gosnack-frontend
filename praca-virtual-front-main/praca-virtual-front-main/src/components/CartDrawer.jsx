// src/components/CartDrawer.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { X, ShoppingCart, UtensilsCrossed } from "lucide-react"
import api from "../services/api"

export default function CartDrawer() {
  const { itens, removerItem, total, limparCarrinho, drawerAberto, fecharCarrinho } = useCart()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")
  const navigate = useNavigate()

  const finalizarPedido = async () => {
    if (itens.length === 0) return
    setEnviando(true)
    setErro("")

    try {
      const restauranteId = itens[0].restauranteId
      const payload = {
        restauranteId,
        itens: itens.map((i) => ({ itemId: i.id, quantidade: i.quantidade })),
      }
      const { data } = await api.post("/pedidos", payload)
      limparCarrinho()
      fecharCarrinho()
      navigate(`/pedido/${data.id}`)
    } catch (err) {
      const msg = err.response?.data?.erro || "Erro ao enviar pedido. Tente novamente."
      setErro(msg)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {drawerAberto && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={fecharCarrinho} />
      )}

      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col w-[85%] max-w-[400px] bg-[#1E1E1E] transition-transform duration-300 ${drawerAberto ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#181818]">
          <h2 className="text-white font-bold text-xl">Seu Carrinho</h2>
          <button
            onClick={fecharCarrinho}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex items-center justify-center rounded-full w-24 h-24 bg-[#2A2A2A]">
                <ShoppingCart size={40} strokeWidth={1.5} className="text-gray-500" />
              </div>
              <p className="font-bold text-white text-lg">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-sm">Adicione itens deliciosos para começar seu pedido</p>
              <button
                onClick={fecharCarrinho}
                className="px-8 py-3 rounded-full text-white font-bold bg-[#3B82F6] hover:bg-[#60A5FA] transition-all"
              >
                Explorar Restaurantes
              </button>
            </div>
          ) : (
            itens.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#2A2A2A]">
                <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-[#3B82F6]/20 flex items-center justify-center">
                  <UtensilsCrossed size={24} strokeWidth={1.5} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{item.nome}</p>
                  <p className="text-sm text-gray-400">Qtd: {item.quantidade}</p>
                  <p className="font-bold text-[#3B82F6]">
                    R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <button
                  onClick={() => removerItem(item.id)}
                  className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-400/10 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        {itens.length > 0 && (
          <div className="px-4 py-4 flex flex-col gap-3 bg-[#181818]">
            {erro && <p className="text-red-400 text-sm text-center">{erro}</p>}
            <div className="flex justify-between items-center">
              <p className="font-bold text-white">Total do pedido</p>
              <p className="font-bold text-xl text-[#3B82F6]">
                R$ {total.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <button
              onClick={finalizarPedido}
              disabled={enviando}
              className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#3B82F6] hover:bg-[#60A5FA] transition-all disabled:opacity-60"
            >
              {enviando ? "Enviando pedido..." : "Finalizar compra"}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
