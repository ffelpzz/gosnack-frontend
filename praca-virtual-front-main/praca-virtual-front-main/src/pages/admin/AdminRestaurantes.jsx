import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { restaurantes as mockRestaurantes } from "../../mocks/data"
import logoQuk from "../../assets/logos/logoquk.png"

// ─── Header Admin ──────────────────────────────────────────────────────────
function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <header className="bg-[#0D0D0D] text-white px-4 py-4 rounded-b-3xl shadow-md flex items-center justify-between">
        <button
          onClick={() => setMenuOpen(true)}
          className="text-2xl active:scale-95 transition"
        >
          ☰
        </button>
        <img src={logoQuk} alt="Logo" className="h-16 object-contain" />
        <div className="w-8 h-8 rounded-full bg-white/20" />
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1E1E1E] z-50 shadow-xl p-5 transition-all duration-300 ease-out ${
          menuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bold text-lg text-white">Menu Admin</h2>
          <button onClick={() => setMenuOpen(false)} className="text-[#9CA3AF]">✕</button>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => { navigate("/admin/restaurantes"); setMenuOpen(false) }}
            className="text-left p-3 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] font-semibold active:scale-95 transition-all duration-150"
          >
            🍽️ Restaurantes
          </button>
          <button
            onClick={() => { navigate("/admin/usuarios"); setMenuOpen(false) }}
            className="text-left p-3 rounded-xl bg-[#2A2A2A] text-white active:scale-95 transition-all duration-150"
          >
            👥 Usuários
          </button>
          <button
            onClick={handleLogout}
            className="text-left p-3 rounded-xl bg-red-500/10 text-red-400 active:scale-95 transition-all duration-150"
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Bottom Nav Admin ───────────────────────────────────────────────────────
function AdminBottomNav({ onAddClick }) {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D] rounded-t-3xl px-8 py-4 flex justify-around items-center shadow-lg">
      <button
        onClick={() => navigate("/admin/restaurantes")}
        className="text-white text-2xl active:scale-95 transition"
      >
        🍽️
      </button>
      <button
        onClick={onAddClick}
        className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center shadow-md active:scale-95 transition"
      >
        +
      </button>
      <button
        onClick={() => navigate("/admin/usuarios")}
        className="text-white text-2xl active:scale-95 transition"
      >
        👥
      </button>
    </nav>
  )
}

// ─── Card de restaurante ────────────────────────────────────────────────────
function RestauranteCard({ restaurante }) {
  const statusConfig = {
    ativo:    { label: "Ativo",                color: "text-green-400",  bg: "bg-green-500/10"  },
    pendente: { label: "Aguardando aprovação", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    inativo:  { label: "Inativo",              color: "text-red-400",    bg: "bg-red-500/10"    },
  }

  const status = restaurante.status || (restaurante.aberto ? "ativo" : "inativo")
  const cfg = statusConfig[status] || statusConfig.ativo

  return (
    <div className="bg-[#1E1E1E] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      <div className="w-14 h-14 bg-[#2A2A2A] rounded-full flex items-center justify-center shadow-sm p-2 flex-shrink-0">
        {restaurante.logo ? (
          <img
            src={restaurante.logo}
            alt={restaurante.nome}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-2xl">🍽️</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{restaurante.nome}</p>
        {restaurante.categoria && (
          <p className="text-xs text-[#9CA3AF]">{restaurante.categoria}</p>
        )}
        <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  )
}

// ─── Formulário de cadastro ────────────────────────────────────────────────
function FormCadastro({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    descricao: "",
    cnpj: "",
    responsavel: "",
    telefone: "",
    email: "",
  })
  const [enviado, setEnviado] = useState(false)

  const categorias = ["Lanches", "Pizzas", "Japonês", "Brasileira", "Árabe", "Sobremesas", "Bebidas", "Outro"]

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = () => {
    const obrigatorios = ["nome", "categoria", "cnpj", "responsavel", "telefone", "email"]
    const vazio = obrigatorios.find((k) => !form[k].trim())
    if (vazio) {
      alert("Preencha todos os campos obrigatórios.")
      return
    }
    onSubmit({ ...form, status: "pendente", id: Date.now() })
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h3 className="font-bold text-xl text-white mb-2">Solicitação enviada!</h3>
        <p className="text-[#9CA3AF] text-sm mb-6">
          Seu restaurante foi cadastrado e está <strong className="text-white">aguardando aprovação</strong> do administrador da Praça Virtual.
          Você será notificado assim que for aprovado.
        </p>
        <button
          onClick={onClose}
          className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white font-semibold px-6 py-3 rounded-2xl active:scale-95 transition"
        >
          Entendido
        </button>
      </div>
    )
  }

  const inputClass = "w-full bg-[#2A2A2A] text-white placeholder-[#9CA3AF] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
  const labelClass = "text-sm font-semibold text-white mb-1 block"

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <label className={labelClass}>Nome do restaurante *</label>
        <input name="nome" value={form.nome} onChange={handleChange}
          placeholder="Ex: Hamburgueria do João" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Categoria *</label>
        <select name="categoria" value={form.categoria} onChange={handleChange}
          className={`${inputClass} appearance-none`}>
          <option value="">Selecione uma categoria</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Descrição</label>
        <textarea name="descricao" value={form.descricao} onChange={handleChange}
          placeholder="Conte um pouco sobre o seu restaurante..."
          rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className={labelClass}>CNPJ *</label>
        <input name="cnpj" value={form.cnpj} onChange={handleChange}
          placeholder="00.000.000/0000-00" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Nome do responsável *</label>
        <input name="responsavel" value={form.responsavel} onChange={handleChange}
          placeholder="Nome completo" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Telefone *</label>
        <input name="telefone" value={form.telefone} onChange={handleChange}
          placeholder="(00) 00000-0000" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>E-mail *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          placeholder="contato@restaurante.com" className={inputClass} />
      </div>

      <p className="text-xs text-[#9CA3AF] -mt-1">* Campos obrigatórios</p>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] text-white font-bold py-4 rounded-2xl active:scale-95 transition mt-2"
      >
        Enviar solicitação
      </button>
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────────────────
export default function AdminRestaurantes() {
  const [busca, setBusca] = useState("")
  const [restaurantes, setRestaurantes] = useState(
    mockRestaurantes.map((r) => ({ ...r, status: r.aberto ? "ativo" : "inativo" }))
  )
  const [showForm, setShowForm] = useState(false)

  const restaurantesFiltrados = busca.trim()
    ? restaurantes.filter((r) =>
        r.nome.toLowerCase().includes(busca.toLowerCase())
      )
    : []

  const handleAdicionarRestaurante = (novoRestaurante) => {
    setRestaurantes((prev) => [novoRestaurante, ...prev])
  }

  return (
    <div className="min-h-screen bg-[#121212] pb-28">
      <AdminHeader />

      <main className="px-4 pt-4">
        <h2 className="text-xl font-bold text-white mb-1">Restaurantes</h2>
        <p className="text-sm text-[#9CA3AF] mb-4">Pesquise para encontrar um restaurante</p>

        {/* Barra de busca */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg">🔍</span>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar restaurante..."
            className="w-full bg-[#2A2A2A] text-white placeholder-[#9CA3AF] rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Resultados */}
        {busca.trim() === "" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[#9CA3AF]">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm">Digite o nome de um restaurante para buscar</p>
          </div>
        ) : restaurantesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[#9CA3AF]">
            <span className="text-5xl mb-3">😕</span>
            <p className="text-sm">Nenhum restaurante encontrado para "<strong className="text-white">{busca}</strong>"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {restaurantesFiltrados.map((r) => (
              <RestauranteCard key={r.id} restaurante={r} />
            ))}
          </div>
        )}
      </main>

      <AdminBottomNav onAddClick={() => setShowForm(true)} />

      {/* Drawer de cadastro */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1E1E] rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 pt-5 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Cadastrar Restaurante</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#9CA3AF] text-xl active:scale-95 transition"
              >
                ✕
              </button>
            </div>
            <div className="px-4 pb-6">
              <FormCadastro
                onClose={() => setShowForm(false)}
                onSubmit={(dados) => {
                  handleAdicionarRestaurante(dados)
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}