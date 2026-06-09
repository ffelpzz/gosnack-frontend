export function adicionarAoCarrinho(itens, item) {
  const existe = itens.find((i) => i.id === item.id)

  if (existe) {
    return itens.map((i) =>
      i.id === item.id
        ? { ...i, quantidade: i.quantidade + 1 }
        : i
    )
  }

  return [...itens, { ...item, quantidade: 1 }]
}

export function removerDoCarrinho(itens, itemId) {
  return itens.filter((item) => item.id !== itemId)
}

export function limparCarrinho() {
  return []
}

export function calcularTotal(itens) {
  return itens.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  )
}

export function calcularQuantidade(itens) {
  return itens.reduce(
    (total, item) => total + item.quantidade,
    0
  )
}