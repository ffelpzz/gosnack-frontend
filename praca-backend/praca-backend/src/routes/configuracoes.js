// src/routes/configuracoes.js
const express = require("express")
const bcrypt = require("bcryptjs")
const { DatabaseSync } = require("node:sqlite")
const path = require("path")
const { autenticar } = require("../middleware/auth")

const router = express.Router()

// Helper: abre conexão com o banco
function getDb() {
  const dbPath = path.join(__dirname, "../../prisma/dev.db")
  return new DatabaseSync(dbPath)
}

// ─── GET /configuracoes/notificacoes ─────────────────────────────────────────
// Retorna as preferências de notificação do usuário logado
router.get("/notificacoes", autenticar, (req, res) => {
  const db = getDb()
  try {
    let config = db
      .prepare("SELECT * FROM NotificacoesConfig WHERE usuarioId = ?")
      .get(req.usuario.id)

    if (!config) {
      // Cria registro padrão se não existir
      db.prepare(
        "INSERT INTO NotificacoesConfig (usuarioId, novosPedidos, notifEmail, notifPlataforma) VALUES (?, 1, 0, 1)"
      ).run(req.usuario.id)
      config = db
        .prepare("SELECT * FROM NotificacoesConfig WHERE usuarioId = ?")
        .get(req.usuario.id)
    }

    return res.json({
      novosPedidos: config.novosPedidos === 1,
      notifEmail: config.notifEmail === 1,
      notifPlataforma: config.notifPlataforma === 1,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao buscar configurações" })
  } finally {
    db.close()
  }
})

// ─── PATCH /configuracoes/notificacoes ───────────────────────────────────────
// Atualiza preferências de notificação
router.patch("/notificacoes", autenticar, (req, res) => {
  const { novosPedidos, notifEmail, notifPlataforma } = req.body
  const db = getDb()

  try {
    // Upsert: atualiza ou cria
    const existe = db
      .prepare("SELECT id FROM NotificacoesConfig WHERE usuarioId = ?")
      .get(req.usuario.id)

    if (existe) {
      const campos = []
      const valores = []

      if (novosPedidos !== undefined) {
        campos.push("novosPedidos = ?")
        valores.push(novosPedidos ? 1 : 0)
      }
      if (notifEmail !== undefined) {
        campos.push("notifEmail = ?")
        valores.push(notifEmail ? 1 : 0)
      }
      if (notifPlataforma !== undefined) {
        campos.push("notifPlataforma = ?")
        valores.push(notifPlataforma ? 1 : 0)
      }

      if (campos.length === 0) {
        return res.status(400).json({ erro: "Nenhum campo fornecido" })
      }

      valores.push(req.usuario.id)
      db.prepare(
        `UPDATE NotificacoesConfig SET ${campos.join(", ")} WHERE usuarioId = ?`
      ).run(...valores)
    } else {
      db.prepare(
        "INSERT INTO NotificacoesConfig (usuarioId, novosPedidos, notifEmail, notifPlataforma) VALUES (?, ?, ?, ?)"
      ).run(
        req.usuario.id,
        novosPedidos !== undefined ? (novosPedidos ? 1 : 0) : 1,
        notifEmail !== undefined ? (notifEmail ? 1 : 0) : 0,
        notifPlataforma !== undefined ? (notifPlataforma ? 1 : 0) : 1
      )
    }

    return res.json({ mensagem: "Notificações atualizadas com sucesso" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao atualizar notificações" })
  } finally {
    db.close()
  }
})

// ─── PATCH /configuracoes/senha ──────────────────────────────────────────────
// Altera a senha do usuário logado
router.patch("/senha", autenticar, async (req, res) => {
  const { senhaAtual, novaSenha, confirmarSenha } = req.body

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" })
  }

  if (novaSenha !== confirmarSenha) {
    return res.status(400).json({ erro: "A nova senha e a confirmação não coincidem" })
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres" })
  }

  const db = getDb()
  try {
    const usuario = db
      .prepare("SELECT id, senha FROM Usuario WHERE id = ?")
      .get(req.usuario.id)

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" })
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha atual incorreta" })
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)
    db.prepare("UPDATE Usuario SET senha = ? WHERE id = ?").run(
      novaSenhaHash,
      req.usuario.id
    )

    return res.json({ mensagem: "Senha alterada com sucesso" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao alterar senha" })
  } finally {
    db.close()
  }
})

// ─── DELETE /configuracoes/conta ─────────────────────────────────────────────
// Exclui a conta do usuário logado e todos os dados relacionados
router.delete("/conta", autenticar, (req, res) => {
  const db = getDb()
  try {
    const usuarioId = req.usuario.id

    // Deleta na ordem correta (foreign keys)
    // 1. ItemPedido dos pedidos do usuário
    db.prepare(`
      DELETE FROM ItemPedido WHERE pedidoId IN (
        SELECT id FROM Pedido WHERE clienteId = ?
      )
    `).run(usuarioId)

    // 2. Pedidos do usuário
    db.prepare("DELETE FROM Pedido WHERE clienteId = ?").run(usuarioId)

    // 3. NotificacoesConfig
    db.prepare("DELETE FROM NotificacoesConfig WHERE usuarioId = ?").run(usuarioId)

    // 4. Usuário
    db.prepare("DELETE FROM Usuario WHERE id = ?").run(usuarioId)

    return res.json({ mensagem: "Conta excluída com sucesso" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: "Erro ao excluir conta" })
  } finally {
    db.close()
  }
})

module.exports = router
