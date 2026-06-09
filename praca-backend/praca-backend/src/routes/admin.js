// src/routes/admin.js
const express = require("express")
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const { autenticar, exigirRole } = require("../middleware/auth")

const router = express.Router()
const prisma = new PrismaClient()

// Todas as rotas /admin exigem ADMIN
router.use(autenticar, exigirRole("ADMIN"))

// ─── RESTAURANTES ────────────────────────────────────────────────

// GET /admin/restaurantes
router.get("/restaurantes", async (req, res) => {
  try {
    const restaurantes = await prisma.restaurante.findMany({
      orderBy: { nome: "asc" },
    })
    return res.json(restaurantes)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar restaurantes" })
  }
})

// POST /admin/restaurantes
router.post("/restaurantes", async (req, res) => {
  const { nome, descricao, logo } = req.body

  if (!nome) {
    return res.status(400).json({ erro: "Nome é obrigatório" })
  }

  try {
    const restaurante = await prisma.restaurante.create({
      data: { nome, descricao: descricao || null, logo: logo || null },
    })
    return res.status(201).json(restaurante)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao criar restaurante" })
  }
})

// PUT /admin/restaurantes/:id
router.put("/restaurantes/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  const { nome, descricao, logo, aberto, ativo } = req.body

  try {
    const restaurante = await prisma.restaurante.update({
      where: { id },
      data: {
        nome: nome ?? undefined,
        descricao: descricao ?? undefined,
        logo: logo ?? undefined,
        aberto: aberto ?? undefined,
        ativo: ativo ?? undefined,
      },
    })
    return res.json(restaurante)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao atualizar restaurante" })
  }
})

// DELETE /admin/restaurantes/:id (soft delete — só desativa)
router.delete("/restaurantes/:id", async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    await prisma.restaurante.update({
      where: { id },
      data: { ativo: false },
    })
    return res.json({ mensagem: "Restaurante desativado com sucesso" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao desativar restaurante" })
  }
})

// ─── USUÁRIOS ─────────────────────────────────────────────────────

// GET /admin/usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        role: true,
        ativo: true,
        criadoEm: true,
        restauranteId: true,
      },
      orderBy: { criadoEm: "desc" },
    })

    // Retorna role em lowercase para o frontend
    return res.json(usuarios.map((u) => ({ ...u, role: u.role.toLowerCase() })))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar usuários" })
  }
})

// PATCH /admin/usuarios/:id — ativa/desativa usuário
router.patch("/usuarios/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  const { ativo } = req.body

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { ativo },
      select: { id: true, nome: true, email: true, ativo: true, role: true },
    })
    return res.json({ ...usuario, role: usuario.role.toLowerCase() })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao atualizar usuário" })
  }
})

// ─── CARDÁPIO (itens) ─────────────────────────────────────────────

// POST /admin/restaurantes/:id/itens
router.post("/restaurantes/:id/itens", async (req, res) => {
  const restauranteId = parseInt(req.params.id)
  const { nome, descricao, preco, categoriaId } = req.body

  if (!nome || preco == null) {
    return res.status(400).json({ erro: "Nome e preço são obrigatórios" })
  }

  try {
    const item = await prisma.item.create({
      data: {
        nome,
        descricao: descricao || null,
        preco: parseFloat(preco),
        restauranteId,
        categoriaId: categoriaId || null,
      },
    })
    return res.status(201).json(item)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao criar item" })
  }
})

// PUT /admin/itens/:id
router.put("/itens/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  const { nome, descricao, preco, disponivel } = req.body

  try {
    const item = await prisma.item.update({
      where: { id },
      data: {
        nome: nome ?? undefined,
        descricao: descricao ?? undefined,
        preco: preco != null ? parseFloat(preco) : undefined,
        disponivel: disponivel ?? undefined,
      },
    })
    return res.json(item)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao atualizar item" })
  }
})

// ─── RELATÓRIOS ───────────────────────────────────────────────────

// GET /admin/relatorios
router.get("/relatorios", async (req, res) => {
  try {
    const totalPedidos = await prisma.pedido.count()
    const totalRestaurantes = await prisma.restaurante.count({ where: { ativo: true } })
    const totalUsuarios = await prisma.usuario.count({ where: { role: "CLIENTE" } })

    const receitaTotal = await prisma.pedido.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PRONTO", "RETIRADO"] } },
    })

    const pedidosPorStatus = await prisma.pedido.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    return res.json({
      totalPedidos,
      totalRestaurantes,
      totalClientes: totalUsuarios,
      receitaTotal: receitaTotal._sum.total || 0,
      pedidosPorStatus: pedidosPorStatus.map((p) => ({
        status: p.status,
        quantidade: p._count.id,
      })),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao gerar relatório" })
  }
})

module.exports = router
