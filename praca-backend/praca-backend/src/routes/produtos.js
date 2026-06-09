// src/routes/produtos.js — CRUD completo de produtos do cardápio
const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { autenticar, exigirRole } = require("../middleware/auth")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const router = express.Router()
const prisma = new PrismaClient()

// ─── Configuração do Multer (upload de imagens) ────────────────────
const uploadDir = path.join(__dirname, "../../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `produto-${Date.now()}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const tipos = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (tipos.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Tipo de arquivo não suportado. Use JPG, PNG ou WebP."), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

// ─── Helpers ──────────────────────────────────────────────────────

function validarProduto({ nome, preco }) {
  const erros = []
  if (!nome || nome.trim().length < 2) erros.push("Nome deve ter pelo menos 2 caracteres")
  if (preco === undefined || preco === null || isNaN(Number(preco))) erros.push("Preço inválido")
  if (Number(preco) < 0) erros.push("Preço não pode ser negativo")
  return erros
}

function imageUrl(req, filename) {
  if (!filename) return null
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`
}

// ─── GET /produtos/restaurante/:restauranteId ──────────────────────
// Retorna TODOS os itens do restaurante (inclusive indisponíveis) — uso do painel
router.get(
  "/restaurante/:restauranteId",
  autenticar,
  exigirRole("RESTAURANTE", "ADMIN"),
  async (req, res) => {
    const restauranteId = parseInt(req.params.restauranteId)

    // Restaurante só acessa os próprios produtos
    if (req.usuario.role === "RESTAURANTE" && req.usuario.restauranteId !== restauranteId) {
      return res.status(403).json({ erro: "Sem permissão para acessar este restaurante" })
    }

    try {
      const itens = await prisma.item.findMany({
        where: { restauranteId },
        include: { categoria: { select: { id: true, nome: true } } },
        orderBy: { nome: "asc" },
      })

      const itensComUrl = itens.map((i) => ({
        ...i,
        imagemUrl: i.imagemFilename ? imageUrl(req, i.imagemFilename) : null,
      }))

      return res.json(itensComUrl)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ erro: "Erro ao listar produtos" })
    }
  }
)

// ─── GET /produtos/:id ─────────────────────────────────────────────
router.get("/:id", autenticar, exigirRole("RESTAURANTE", "ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { categoria: true },
    })
    if (!item) return res.status(404).json({ erro: "Produto não encontrado" })

    if (req.usuario.role === "RESTAURANTE" && item.restauranteId !== req.usuario.restauranteId) {
      return res.status(403).json({ erro: "Sem permissão" })
    }

    return res.json({ ...item, imagemUrl: item.imagemFilename ? imageUrl(req, item.imagemFilename) : null })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar produto" })
  }
})

// ─── POST /produtos ────────────────────────────────────────────────
router.post(
  "/",
  autenticar,
  exigirRole("RESTAURANTE", "ADMIN"),
  upload.single("imagem"),
  async (req, res) => {
    const { nome, descricao, preco, categoria, disponivel, restauranteId } = req.body
    const restId = parseInt(restauranteId)

    if (req.usuario.role === "RESTAURANTE" && req.usuario.restauranteId !== restId) {
      return res.status(403).json({ erro: "Sem permissão para este restaurante" })
    }

    const erros = validarProduto({ nome, preco })
    if (erros.length) return res.status(400).json({ erro: erros.join(", ") })

    try {
      // Garante/cria a categoria
      let categoriaId = null
      if (categoria && categoria.trim()) {
        const cat = await prisma.categoria.upsert({
          where: { nome: categoria.trim() },
          update: {},
          create: { nome: categoria.trim() },
        })
        categoriaId = cat.id
      }

      const item = await prisma.item.create({
        data: {
          nome: nome.trim(),
          descricao: descricao?.trim() || null,
          preco: parseFloat(preco),
          disponivel: disponivel === "true" || disponivel === true,
          restauranteId: restId,
          categoriaId,
          imagemFilename: req.file ? req.file.filename : null,
        },
        include: { categoria: true },
      })

      return res.status(201).json({
        ...item,
        imagemUrl: item.imagemFilename ? imageUrl(req, item.imagemFilename) : null,
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ erro: "Erro ao criar produto" })
    }
  }
)

// ─── PUT /produtos/:id ─────────────────────────────────────────────
router.put(
  "/:id",
  autenticar,
  exigirRole("RESTAURANTE", "ADMIN"),
  upload.single("imagem"),
  async (req, res) => {
    const id = parseInt(req.params.id)
    const { nome, descricao, preco, categoria, disponivel } = req.body

    const erros = validarProduto({ nome, preco })
    if (erros.length) return res.status(400).json({ erro: erros.join(", ") })

    try {
      const itemExistente = await prisma.item.findUnique({ where: { id } })
      if (!itemExistente) return res.status(404).json({ erro: "Produto não encontrado" })

      if (
        req.usuario.role === "RESTAURANTE" &&
        itemExistente.restauranteId !== req.usuario.restauranteId
      ) {
        return res.status(403).json({ erro: "Sem permissão" })
      }

      // Deleta a imagem antiga se uma nova foi enviada
      if (req.file && itemExistente.imagemFilename) {
        const oldPath = path.join(uploadDir, itemExistente.imagemFilename)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      // Garante/cria a categoria
      let categoriaId = null
      if (categoria && categoria.trim()) {
        const cat = await prisma.categoria.upsert({
          where: { nome: categoria.trim() },
          update: {},
          create: { nome: categoria.trim() },
        })
        categoriaId = cat.id
      }

      const itemAtualizado = await prisma.item.update({
        where: { id },
        data: {
          nome: nome.trim(),
          descricao: descricao?.trim() || null,
          preco: parseFloat(preco),
          disponivel: disponivel === "true" || disponivel === true,
          categoriaId,
          ...(req.file ? { imagemFilename: req.file.filename } : {}),
        },
        include: { categoria: true },
      })

      return res.json({
        ...itemAtualizado,
        imagemUrl: itemAtualizado.imagemFilename ? imageUrl(req, itemAtualizado.imagemFilename) : null,
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ erro: "Erro ao atualizar produto" })
    }
  }
)

// ─── PATCH /produtos/:id/disponibilidade ──────────────────────────
router.patch(
  "/:id/disponibilidade",
  autenticar,
  exigirRole("RESTAURANTE", "ADMIN"),
  async (req, res) => {
    const id = parseInt(req.params.id)
    const { disponivel } = req.body

    try {
      const itemExistente = await prisma.item.findUnique({ where: { id } })
      if (!itemExistente) return res.status(404).json({ erro: "Produto não encontrado" })

      if (
        req.usuario.role === "RESTAURANTE" &&
        itemExistente.restauranteId !== req.usuario.restauranteId
      ) {
        return res.status(403).json({ erro: "Sem permissão" })
      }

      const item = await prisma.item.update({
        where: { id },
        data: { disponivel: Boolean(disponivel) },
      })

      return res.json(item)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ erro: "Erro ao atualizar disponibilidade" })
    }
  }
)

// ─── DELETE /produtos/:id ──────────────────────────────────────────
router.delete("/:id", autenticar, exigirRole("RESTAURANTE", "ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const itemExistente = await prisma.item.findUnique({ where: { id } })
    if (!itemExistente) return res.status(404).json({ erro: "Produto não encontrado" })

    if (
      req.usuario.role === "RESTAURANTE" &&
      itemExistente.restauranteId !== req.usuario.restauranteId
    ) {
      return res.status(403).json({ erro: "Sem permissão" })
    }

    // Remove a imagem do disco
    if (itemExistente.imagemFilename) {
      const imgPath = path.join(uploadDir, itemExistente.imagemFilename)
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
    }

    await prisma.item.delete({ where: { id } })
    return res.json({ mensagem: "Produto removido com sucesso" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao remover produto" })
  }
})

module.exports = router
