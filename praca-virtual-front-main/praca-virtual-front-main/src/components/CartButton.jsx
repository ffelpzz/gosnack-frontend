import { useCart } from "../context/CartContext"
import { ShoppingCart } from "lucide-react"

export default function CartButton() {
  const { quantidadeTotal, abrirCarrinho } = useCart()

  return (
    <button
      onClick={abrirCarrinho}
      className="relative flex items-center justify-center w-12 h-12 rounded-full
                 bg-[#1E1E1E] border border-[#2A2A2A]
                 hover:bg-[#2A2A2A]
                 active:scale-90
                 transition-all duration-200"
    >
      <ShoppingCart size={20} strokeWidth={1.8} className="text-white" />

      {quantidadeTotal > 0 && (
        <span
          className="absolute -top-1 -right-1
                     bg-[#3B82F6] text-white text-[10px] font-bold
                     rounded-full w-5 h-5 flex items-center justify-center
                     shadow-md animate-[pop_0.25s_ease]"
        >
          {quantidadeTotal > 9 ? "9+" : quantidadeTotal}
        </span>
      )}
    </button>
  )
}
