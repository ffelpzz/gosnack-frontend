// src/index.js — Servidor principal da Praça Virtual
require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const authRoutes = require("./routes/auth")
const restaurantesRoutes = require("./routes/restaurantes")
const pedidosRoutes = require("./routes/pedidos")
const adminRoutes = require("./routes/admin")
const produtosRoutes = require("./routes/produtos")
const configuracoesRoutes = require("./routes/configuracoes")

const app = express()
const PORT = process.env.PORT || 3001

// ─── Middlewares globais ───────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}))

app.use(express.json())

// Serve imagens de produtos como arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Log de requisições (ajuda no debug durante desenvolvimento)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString("pt-BR")}] ${req.method} ${req.path}`)
  next()
})

// ─── Rotas ────────────────────────────────────────────────────────

app.use("/auth", authRoutes)
app.use("/restaurantes", restaurantesRoutes)
app.use("/pedidos", pedidosRoutes)
app.use("/admin", adminRoutes)
app.use("/produtos", produtosRoutes)
app.use("/configuracoes", configuracoesRoutes)

// Rota de verificação — útil para checar se o servidor está rodando
app.get("/", (req, res) => {
  res.json({
    mensagem: "Praça Virtual API está rodando! 🍔",
    versao: "1.0.0",
    rotas: ["/auth", "/restaurantes", "/pedidos", "/admin", "/produtos"],
  })
})

// Handler de rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.path} não encontrada` })
})

// Handler de erros globais (inclui erros do multer)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ erro: "Imagem muito grande. Máximo 5 MB." })
  }
  console.error("Erro não tratado:", err)
  res.status(500).json({ erro: err.message || "Erro interno no servidor" })
})

// ─── Inicia o servidor ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("")
  console.log("🚀 Praça Virtual Backend rodando!")
  console.log(`   URL: http://localhost:${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV || "development"}`)
  console.log("")
  console.log("Rotas disponíveis:")
  console.log("  POST   /auth/cadastro")
  console.log("  POST   /auth/login")
  console.log("  GET    /restaurantes")
  console.log("  GET    /restaurantes/:id/itens")
  console.log("  POST   /pedidos              (requer token)")
  console.log("  GET    /pedidos/meus         (requer token)")
  console.log("  PATCH  /pedidos/:id/status   (requer token restaurante/admin)")
  console.log("  GET    /admin/restaurantes   (requer token admin)")
  console.log("  GET    /admin/usuarios       (requer token admin)")
  console.log("  GET    /produtos/restaurante/:id  (requer token restaurante/admin)")
  console.log("  POST   /produtos             (requer token restaurante/admin)")
  console.log("  PUT    /produtos/:id         (requer token restaurante/admin)")
  console.log("  DELETE /produtos/:id         (requer token restaurante/admin)")
  console.log("")
})
