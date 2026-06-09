import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [itens, setItens] = useState(
    JSON.parse(localStorage.getItem("carrinho")) || []
  )

  const [drawerAberto, setDrawerAberto] = useState(false)

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(itens))
  }, [itens])

  const adicionarItem = (item) => {
    setItens((prev) => {
      const existente = prev.find((i) => i.id === item.id)

      if (existente) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }

      return [...prev, { ...item, quantidade: 1 }]
    })

    setDrawerAberto(true)
  }

  const removerItem = (id) => {
    setItens((prev) => prev.filter((i) => i.id !== id))
  }

  const limparCarrinho = () => {
    setItens([])
  }

  const abrirCarrinho = () => setDrawerAberto(true)
  const fecharCarrinho = () => setDrawerAberto(false)

  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

  const quantidadeTotal = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  )

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        limparCarrinho,
        total,
        quantidadeTotal,
        drawerAberto,
        abrirCarrinho,
        fecharCarrinho
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}