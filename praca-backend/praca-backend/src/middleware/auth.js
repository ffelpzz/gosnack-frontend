// src/middleware/auth.js
const jwt = require("jsonwebtoken")

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // Normaliza role para maiúsculo internamente (o token pode ter qualquer case)
    req.usuario = { ...payload, role: payload.role.toUpperCase() }
    next()
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado" })
  }
}

function exigirRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: "Não autenticado" })
    }
    // Compara em maiúsculo dos dois lados
    const rolesUpper = roles.map((r) => r.toUpperCase())
    if (!rolesUpper.includes(req.usuario.role)) {
      return res.status(403).json({ erro: "Sem permissão para esta ação" })
    }
    next()
  }
}

module.exports = { autenticar, exigirRole }
