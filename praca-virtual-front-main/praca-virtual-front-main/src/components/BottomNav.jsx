import { useNavigate, useLocation } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { Home, ShoppingCart } from "lucide-react"

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { abrirCarrinho } = useCart()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#2A2A2A] px-8 py-4 flex justify-around items-center z-50">

      {/* Home */}
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 transition-all duration-150 ${isActive("/") ? "text-[#3B82F6]" : "text-gray-400 hover:text-white"
          }`}
      >
        <Home size={22} strokeWidth={isActive("/") ? 2.5 : 1.8} />
        <span className="text-[10px] font-medium">Início</span>
      </button>

      {/* Carrinho */}
      <button
        onClick={abrirCarrinho}
        className="flex flex-col items-center gap-1 text-gray-400 hover:text-white active:scale-95 transition-all duration-150"
      >
        <ShoppingCart size={22} strokeWidth={1.8} />
        <span className="text-[10px] font-medium">Carrinho</span>
      </button>

    </nav>
  )
}
