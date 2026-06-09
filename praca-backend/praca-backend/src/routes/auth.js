// src/routes/auth.js
const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const { autenticar } = require("../middleware/auth")

const router = express.Router()
const prisma = new PrismaClient()

// POST /auth/cadastro
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha, cpf, telefone } = req.body

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" })
  }

  try {
    const jaExiste = await prisma.usuario.findUnique({ where: { email } })
    if (jaExiste) {
      return res.status(409).json({ erro: "Email já cadastrado" })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cpf: cpf || null,
        telefone: telefone || null,
        role: "CLIENTE",
      },
    })

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role, restauranteId: usuario.restauranteId || null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return res.status(201).json({
      token,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role.toLowerCase(),
      restauranteId: usuario.restauranteId || null,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro interno no servidor" })
  }
})

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" })
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: "Email ou senha inválidos" })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha inválidos" })
    }

    // ✅ restauranteId incluído no token agora
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role, restauranteId: usuario.restauranteId || null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return res.json({
      token,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role.toLowerCase(), // frontend usa lowercase
      restauranteId: usuario.restauranteId || null,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro interno no servidor" })
  }
})

// PATCH /auth/perfil atualiza nome telefone de quem ta logado

router.patch("/perfil", autenticar, async (req, res) => {
  const { nome, telefone } = req.body

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: "Nome é obrigatório" })
  }

  try {
    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { nome: nome.trim(), telefone: telefone || null },
    })
    return res.json({ mensagem: "Perfil atualizado com sucesso" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao atualizar perfil" })
  }
})

module.exports = router
