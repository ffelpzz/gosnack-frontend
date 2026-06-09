// src/pages/cliente/Configuracoes.jsx
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Header from "../../components/Header"
import BottomNav from "../../components/BottomNav"
import api from "../../services/api"

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ mensagem, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const cor =
    tipo === "sucesso"
      ? "bg-green-500/15 border border-green-500/30 text-green-400"
      : "bg-red-500/15 border border-red-500/30 text-red-400"

  const icone = tipo === "sucesso" ? "✅" : "❌"

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl shadow-xl ${cor} text-sm font-semibold flex items-center gap-2 max-w-[90vw] animate-[slideDown_.25s_ease]`}
    >
      <span>{icone}</span>
      <span>{mensagem}</span>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ titulo, descricao, textoBotao, corBotao, onConfirmar, onCancelar, carregando }) {
  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/70" onClick={onCancelar} />
      <div className="relative bg-[#1E1E1E] rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-bold text-lg text-center mb-3">{titulo}</h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">{descricao}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirmar}
            disabled={carregando}
            className={`w-full py-3.5 rounded-2xl text-white font-bold transition-all active:scale-95 disabled:opacity-60 ${corBotao}`}
          >
            {carregando ? "Aguarde..." : textoBotao}
          </button>
          <button
            onClick={onCancelar}
            disabled={carregando}
            className="w-full py-3.5 rounded-2xl text-gray-400 font-semibold bg-[#2A2A2A] hover:bg-[#333] transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Switch ──────────────────────────────────────────────────────────────────
function Switch({ ativo, onChange, desabilitado }) {
  return (
    <button
      onClick={() => !desabilitado && onChange(!ativo)}
      disabled={desabilitado}
      className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        ativo ? "bg-[#3B82F6]" : "bg-[#3A3A3A]"
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          ativo ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  )
}

// ─── SwitchRow ───────────────────────────────────────────────────────────────
function SwitchRow({ icone, titulo, descricao, ativo, onChange, salvando }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[#2A2A2A] last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icone}</span>
        <div>
          <p className="text-white font-medium text-sm">{titulo}</p>
          <p className="text-gray-500 text-xs mt-0.5">{descricao}</p>
        </div>
      </div>
      <Switch ativo={ativo} onChange={onChange} desabilitado={salvando} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Configuracoes() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  // Notificações
  const [notif, setNotif] = useState({
    novosPedidos: true,
    notifEmail: false,
    notifPlataforma: true,
  })
  const [salvandoNotif, setSalvandoNotif] = useState(false)
  const [carregandoNotif, setCarregandoNotif] = useState(true)

  // Senha
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [mostrarSenhas, setMostrarSenhas] = useState(false)

  // Modais
  const [modalLogout, setModalLogout] = useState(false)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)

  const mostrarToast = useCallback((mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo })
  }, [])

  // ── Carrega notificações ──
  useEffect(() => {
    api
      .get("/configuracoes/notificacoes")
      .then(({ data }) => setNotif(data))
      .catch(() => {}) // usa defaults
      .finally(() => setCarregandoNotif(false))
  }, [])

  // ── Atualiza switch de notificação ──
  const handleNotifChange = async (campo, valor) => {
    const anterior = notif[campo]
    setNotif((prev) => ({ ...prev, [campo]: valor }))
    setSalvandoNotif(true)
    try {
      await api.patch("/configuracoes/notificacoes", { [campo]: valor })
      mostrarToast("Preferências atualizadas!")
    } catch {
      setNotif((prev) => ({ ...prev, [campo]: anterior }))
      mostrarToast("Erro ao salvar preferência.", "erro")
    } finally {
      setSalvandoNotif(false)
    }
  }

  // ── Altera senha ──
  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      mostrarToast("Preencha todos os campos.", "erro")
      return
    }
    if (novaSenha !== confirmarSenha) {
      mostrarToast("As senhas não coincidem.", "erro")
      return
    }
    if (novaSenha.length < 6) {
      mostrarToast("A senha deve ter ao menos 6 caracteres.", "erro")
      return
    }
    setSalvandoSenha(true)
    try {
      await api.patch("/configuracoes/senha", { senhaAtual, novaSenha, confirmarSenha })
      mostrarToast("Senha alterada com sucesso!")
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
    } catch (err) {
      mostrarToast(err.response?.data?.erro || "Erro ao alterar senha.", "erro")
    } finally {
      setSalvandoSenha(false)
    }
  }

  // ── Logout ──
  const handleConfirmarLogout = () => {
    setCarregandoAcao(true)
    setTimeout(() => {
      logout()
      navigate("/login")
    }, 500)
  }

  // ── Excluir conta ──
  const handleConfirmarExcluir = async () => {
    setCarregandoAcao(true)
    try {
      await api.delete("/configuracoes/conta")
      logout()
      navigate("/login")
    } catch (err) {
      mostrarToast(err.response?.data?.erro || "Erro ao excluir conta.", "erro")
      setCarregandoAcao(false)
      setModalExcluir(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-28">
      <Header />

      {/* Toast */}
      {toast && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modais */}
      {modalLogout && (
        <Modal
          titulo="Sair da Conta"
          descricao="Tem certeza que deseja sair da sua conta?"
          textoBotao="Confirmar Logout"
          corBotao="bg-[#3B82F6] hover:bg-[#60A5FA]"
          onConfirmar={handleConfirmarLogout}
          onCancelar={() => setModalLogout(false)}
          carregando={carregandoAcao}
        />
      )}

      {modalExcluir && (
        <Modal
          titulo="Excluir Conta"
          descricao={"Esta ação é permanente e não poderá ser desfeita.\n\nTem certeza que deseja excluir sua conta?"}
          textoBotao="Excluir Conta"
          corBotao="bg-red-500 hover:bg-red-600"
          onConfirmar={handleConfirmarExcluir}
          onCancelar={() => { setModalExcluir(false); setCarregandoAcao(false) }}
          carregando={carregandoAcao}
        />
      )}

      <div className="px-4 pt-6 max-w-md mx-auto flex flex-col gap-5">
        {/* Título */}
        <div className="mb-1">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie sua conta e preferências</p>
        </div>

        {/* ── Seção: Notificações ── */}
        <section className="bg-[#1E1E1E] rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔔</span>
            <h2 className="font-bold text-base">Notificações</h2>
          </div>

          {carregandoNotif ? (
            <div className="flex flex-col gap-4 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="w-40 h-4 bg-[#2A2A2A] rounded-full animate-pulse" />
                  <div className="w-12 h-6 bg-[#2A2A2A] rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <SwitchRow
                icone="📦"
                titulo="Novos pedidos"
                descricao="Alertas quando um pedido for feito"
                ativo={notif.novosPedidos}
                onChange={(v) => handleNotifChange("novosPedidos", v)}
                salvando={salvandoNotif}
              />
              <SwitchRow
                icone="📧"
                titulo="Notificações por e-mail"
                descricao="Receba atualizações no seu e-mail"
                ativo={notif.notifEmail}
                onChange={(v) => handleNotifChange("notifEmail", v)}
                salvando={salvandoNotif}
              />
              <SwitchRow
                icone="🔔"
                titulo="Notificações na plataforma"
                descricao="Alertas dentro do aplicativo"
                ativo={notif.notifPlataforma}
                onChange={(v) => handleNotifChange("notifPlataforma", v)}
                salvando={salvandoNotif}
              />
            </>
          )}
        </section>

        {/* ── Seção: Segurança ── */}
        <section className="bg-[#1E1E1E] rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔒</span>
            <h2 className="font-bold text-base">Segurança</h2>
          </div>

          <div className="flex flex-col gap-3">
            {/* Senha atual */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block pl-1">Senha atual</label>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#2A2A2A]">
                <span className="text-lg">🔑</span>
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Nova senha */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block pl-1">Nova senha</label>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#2A2A2A]">
                <span className="text-lg">🔒</span>
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Confirmar nova senha */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block pl-1">Confirmar nova senha</label>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#2A2A2A]">
                <span className="text-lg">✅</span>
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Mostrar senhas */}
            <button
              onClick={() => setMostrarSenhas((v) => !v)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors pl-1"
            >
              <span>{mostrarSenhas ? "🙈" : "👁️"}</span>
              {mostrarSenhas ? "Ocultar senhas" : "Mostrar senhas"}
            </button>

            {/* Indicador de força */}
            {novaSenha.length > 0 && (
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4].map((n) => {
                  const forca = Math.min(Math.floor(novaSenha.length / 3), 4)
                  const cor =
                    forca >= n
                      ? forca <= 1
                        ? "bg-red-500"
                        : forca <= 2
                        ? "bg-yellow-500"
                        : forca <= 3
                        ? "bg-blue-500"
                        : "bg-green-500"
                      : "bg-[#3A3A3A]"
                  return <div key={n} className={`h-1 flex-1 rounded-full ${cor} transition-all`} />
                })}
                <span className="text-xs text-gray-500 ml-1">
                  {novaSenha.length < 4
                    ? "Fraca"
                    : novaSenha.length < 7
                    ? "Razoável"
                    : novaSenha.length < 10
                    ? "Boa"
                    : "Forte"}
                </span>
              </div>
            )}

            <button
              onClick={handleAlterarSenha}
              disabled={salvandoSenha}
              className="w-full mt-1 py-3.5 rounded-2xl text-white font-bold bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-95 transition-all disabled:opacity-60"
            >
              {salvandoSenha ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </section>

        {/* ── Seção: Logout ── */}
        <section className="bg-[#1E1E1E] rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🚪</span>
            <h2 className="font-bold text-base">Sessão</h2>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-white font-medium text-sm">{usuario?.nome}</p>
              <p className="text-gray-500 text-xs mt-0.5">{usuario?.email}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/15 text-[#3B82F6] capitalize flex-shrink-0">
              {usuario?.role}
            </span>
          </div>

          <button
            onClick={() => setModalLogout(true)}
            className="w-full py-3.5 rounded-2xl text-white font-bold bg-[#2A2A2A] hover:bg-[#333] border border-[#3A3A3A] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            Sair da Conta
          </button>
        </section>

        {/* ── Seção: Zona de Perigo ── */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <h2 className="font-bold text-base text-red-400">Zona de Perigo</h2>
          </div>
          <p className="text-gray-500 text-xs mb-4 leading-relaxed">
            Ao excluir sua conta, todos os seus dados — incluindo pedidos e histórico — serão permanentemente removidos. Esta ação não pode ser desfeita.
          </p>
          <button
            onClick={() => setModalExcluir(true)}
            className="w-full py-3.5 rounded-2xl text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            Excluir Conta
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
