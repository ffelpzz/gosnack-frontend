// src/routes/pedidos.js
const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { autenticar, exigirRole } = require("../middleware/auth")

const router = express.Router()
const prisma = new PrismaClient()

// Mapeamento de status para exibição no frontend
const statusLabel = {
  AGUARDANDO: "Aguardando confirmação",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto para retirada",
  RETIRADO: "Retirado",
}

// POST /pedidos — cria um novo pedido (cliente logado)
// Body: { restauranteId, itens: [{ itemId, quantidade }] }
router.post("/", autenticar, async (req, res) => {
  const { restauranteId, itens } = req.body

  if (!restauranteId || !itens || itens.length === 0) {
    return res.status(400).json({ erro: "Dados do pedido inválidos" })
  }

  try {
    // Busca os itens no banco para pegar os preços reais (nunca confie no preço do frontend)
    const idsItens = itens.map((i) => i.itemId)
    const itensDB = await prisma.item.findMany({
      where: { id: { in: idsItens } },
    })

    if (itensDB.length !== idsItens.length) {
      return res.status(400).json({ erro: "Um ou mais itens não encontrados" })
    }

    // Calcula o total no servidor
    let total = 0
    const itensPedido = itens.map((itemReq) => {
      const itemDB = itensDB.find((i) => i.id === itemReq.itemId)
      const subtotal = itemDB.preco * itemReq.quantidade
      total += subtotal
      return {
        itemId: itemDB.id,
        quantidade: itemReq.quantidade,
        precoUnit: itemDB.preco,
      }
    })

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: req.usuario.id,
        restauranteId,
        total,
        status: "AGUARDANDO",
        itens: { create: itensPedido },
      },
      include: {
        itens: { include: { item: true } },
        restaurante: { select: { id: true, nome: true } },
      },
    })

    return res.status(201).json({
      ...pedido,
      statusLabel: statusLabel[pedido.status],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao criar pedido" })
  }
})

// GET /pedidos/meus — pedidos do cliente logado
router.get("/meus", autenticar, async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { clienteId: req.usuario.id },
      include: {
        restaurante: { select: { id: true, nome: true } },
        itens: {
          include: { item: { select: { id: true, nome: true } } },
        },
      },
      orderBy: { criadoEm: "desc" },
    })

    const pedidosFormatados = pedidos.map((p) => ({
      id: p.id,
      restaurante: p.restaurante.nome,
      status: statusLabel[p.status] || p.status,
      statusRaw: p.status,
      total: p.total,
      criadoEm: p.criadoEm,
      itens: p.itens.map((i) => ({
        nome: i.item.nome,
        quantidade: i.quantidade,
        precoUnit: i.precoUnit,
      })),
    }))

    return res.json(pedidosFormatados)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar pedidos" })
  }
})

// GET /pedidos/:id — detalhes de um pedido
router.get("/:id", autenticar, async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        restaurante: { select: { id: true, nome: true } },
        cliente: { select: { id: true, nome: true } },
        itens: {
          include: { item: { select: { id: true, nome: true } } },
        },
      },
    })

    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" })

    // Só o dono ou restaurante/admin podem ver
    const ehDono = pedido.clienteId === req.usuario.id
    const ehRestaurante = req.usuario.role === "RESTAURANTE" && pedido.restauranteId === req.usuario.restauranteId
    const ehAdmin = req.usuario.role === "ADMIN"

    if (!ehDono && !ehRestaurante && !ehAdmin) {
      return res.status(403).json({ erro: "Sem permissão" })
    }

    return res.json({
      ...pedido,
      statusLabel: statusLabel[pedido.status],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar pedido" })
  }
})

// GET /pedidos/restaurante/:id — fila de pedidos do restaurante
router.get("/restaurante/:id", autenticar, exigirRole("RESTAURANTE", "ADMIN"), async (req, res) => {
  const restauranteId = parseInt(req.params.id)

  // Restaurante só pode ver os próprios pedidos
  if (req.usuario.role === "RESTAURANTE" && req.usuario.restauranteId !== restauranteId) {
    return res.status(403).json({ erro: "Sem permissão" })
  }

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        restauranteId,
        status: { in: ["AGUARDANDO", "EM_PREPARO", "PRONTO"] },
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        itens: {
          include: { item: { select: { id: true, nome: true } } },
        },
      },
      orderBy: { criadoEm: "asc" },
    })

    return res.json(
      pedidos.map((p) => ({
        ...p,
        statusLabel: statusLabel[p.status],
      }))
    )
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar fila de pedidos" })
  }
})

// PATCH /pedidos/:id/status — atualiza status do pedido
// Body: { status: "EM_PREPARO" | "PRONTO" | "RETIRADO" }
router.patch("/:id/status", autenticar, async (req, res) => {
  const id = parseInt(req.params.id)
  const { status } = req.body

  const statusValidos = ["AGUARDANDO", "EM_PREPARO", "PRONTO", "RETIRADO"]
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(", ")}` })
  }

  try {
    const pedido = await prisma.pedido.findUnique({ where: { id } })
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" })

    const ehRestauranteOuAdmin = ["RESTAURANTE", "ADMIN"].includes(req.usuario.role)
    const ehCliente = req.usuario.role === "CLIENTE"

    // Cliente só pode confirmar chegada (PRONTO → RETIRADO)
    if (ehCliente) {
      if (pedido.clienteId !== req.usuario.id) return res.status(403).json({ erro: "Sem permissão" })
      if (status !== "RETIRADO" || pedido.status !== "PRONTO") {
        return res.status(403).json({ erro: "Você só pode confirmar chegada quando o pedido estiver pronto" })
      }
    } else if (!ehRestauranteOuAdmin) {
      return res.status(403).json({ erro: "Sem permissão" })
    }

    const atualizado = await prisma.pedido.update({ where: { id }, data: { status } })
    return res.json({ ...atualizado, statusLabel: statusLabel[atualizado.status] })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao atualizar status" })
  }
})

module.exports = router
