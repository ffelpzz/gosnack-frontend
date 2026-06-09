// src/routes/restaurantes.js
const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { autenticar, exigirRole } = require("../middleware/auth")

const router = express.Router()
const prisma = new PrismaClient()

// GET /restaurantes — lista todos os restaurantes ativos
router.get("/", async (req, res) => {
  try {
    const restaurantes = await prisma.restaurante.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        logo: true,
        aberto: true,
      },
      orderBy: { nome: "asc" },
    })
    return res.json(restaurantes)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar restaurantes" })
  }
})

// GET /restaurantes/:id — detalhes de um restaurante
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const restaurante = await prisma.restaurante.findUnique({
      where: { id },
    })

    if (!restaurante) {
      return res.status(404).json({ erro: "Restaurante não encontrado" })
    }

    return res.json(restaurante)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar restaurante" })
  }
})

// GET /restaurantes/:id/itens — cardápio do restaurante
router.get("/:id/itens", async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const itens = await prisma.item.findMany({
      where: {
        restauranteId: id,
        disponivel: true,
      },
      include: {
        categoria: { select: { id: true, nome: true } },
      },
      orderBy: { nome: "asc" },
    })
    return res.json(itens)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar itens" })
  }
})

module.exports = router
