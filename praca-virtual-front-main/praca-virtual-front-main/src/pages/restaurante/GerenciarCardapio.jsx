// src/pages/restaurante/GerenciarCardapio.jsx
import { useEffect, useState, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  alterarDisponibilidade,
  deletarProduto,
} from "../../services/produtosService"

// ─── Toast ─────────────────────────────────────────────────────────
function Toast({ mensagem, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const cor =
    tipo === "sucesso"
      ? "bg-green-500/90 border-green-400"
      : "bg-red-500/90 border-red-400"

  return (
    <div
      className={`fixed top-5 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border text-white text-sm font-medium shadow-xl backdrop-blur-sm transition-all ${cor}`}
    >
      <span>{tipo === "sucesso" ? "✅" : "❌"}</span>
      <span>{mensagem}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

// ─── Confirmação de exclusão ────────────────────────────────────────
function ModalConfirmacao({ produto, onConfirmar, onCancelar, carregando }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 border border-[#2A2A2A]">
        <div className="text-center">
          <span className="text-4xl">🗑️</span>
          <h3 className="text-white font-bold text-lg mt-2">Excluir produto?</h3>
          <p className="text-gray-400 text-sm mt-1">
            Tem certeza que deseja excluir <span className="text-white font-semibold">{produto?.nome}</span>?
            Essa ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-3 rounded-full border border-[#3A3A3A] text-gray-300 hover:bg-[#2A2A2A] transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={carregando}
            className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold transition-colors"
          >
            {carregando ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Formulário de produto (criar / editar) ─────────────────────────
const CATEGORIAS_PADRAO = ["Lanches", "Pizzas", "Bebidas", "Sobremesas", "Combos", "Saladas", "Outros"]

function FormularioProduto({ produto, restauranteId, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    nome: produto?.nome || "",
    descricao: produto?.descricao || "",
    preco: produto?.preco?.toString() || "",
    categoria: produto?.categoria?.nome || "",
    disponivel: produto?.disponivel !== false,
  })
  const [imagemFile, setImagemFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(produto?.imagemUrl || null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const fileRef = useRef()

  const handleImagem = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErro("Imagem muito grande. Máximo 5 MB.")
      return
    }
    setImagemFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setErro("")
  }

  const handleSubmit = async () => {
    if (!form.nome.trim()) return setErro("Nome é obrigatório")
    if (!form.preco || isNaN(Number(form.preco))) return setErro("Preço inválido")
    if (Number(form.preco) < 0) return setErro("Preço não pode ser negativo")

    setSalvando(true)
    setErro("")

    const fd = new FormData()
    fd.append("nome", form.nome.trim())
    fd.append("descricao", form.descricao.trim())
    fd.append("preco", form.preco)
    fd.append("categoria", form.categoria.trim())
    fd.append("disponivel", String(form.disponivel))
    fd.append("restauranteId", String(restauranteId))
    if (imagemFile) fd.append("imagem", imagemFile)

    try {
      if (produto) {
        await onSalvar("editar", produto.id, fd)
      } else {
        await onSalvar("criar", null, fd)
      }
    } catch (err) {
      setErro(err?.response?.data?.erro || "Erro ao salvar produto")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-0 sm:px-4">
      <div className="bg-[#1E1E1E] w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col border border-[#2A2A2A] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1E1E1E] z-10">
          <h3 className="text-white font-bold text-lg">
            {produto ? "✏️ Editar produto" : "➕ Novo produto"}
          </h3>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2A2A2A]"
          >✕</button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Upload de imagem */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-36 rounded-2xl border-2 border-dashed border-[#3A3A3A] hover:border-[#3B82F6] cursor-pointer overflow-hidden transition-colors group"
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">Trocar imagem</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span className="text-3xl">📷</span>
                <span className="text-gray-400 text-sm">Clique para adicionar imagem</span>
                <span className="text-gray-600 text-xs">JPG, PNG ou WebP • máx. 5 MB</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImagem}
            />
          </div>

          {/* Nome */}
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Nome *</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Whopper"
              className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-gray-600"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ingredientes, informações extras..."
              rows={2}
              className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-gray-600 resize-none"
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                placeholder="0,00"
                className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Categoria</label>
              <input
                list="categorias-list"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                placeholder="Lanches"
                className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-gray-600"
              />
              <datalist id="categorias-list">
                {CATEGORIAS_PADRAO.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="flex items-center justify-between bg-[#2A2A2A] rounded-xl px-4 py-3">
            <div>
              <p className="text-white text-sm font-semibold">Disponível para venda</p>
              <p className="text-gray-500 text-xs">Clientes poderão adicionar ao carrinho</p>
            </div>
            <button
              onClick={() => setForm({ ...form, disponivel: !form.disponivel })}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.disponivel ? "bg-[#3B82F6]" : "bg-[#444]"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${form.disponivel ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {erro}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pb-2">
            <button
              onClick={onCancelar}
              className="flex-1 py-3 rounded-full border border-[#3A3A3A] text-gray-300 hover:bg-[#2A2A2A] transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={salvando}
              className="flex-1 py-3 rounded-full bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white font-bold transition-colors"
            >
              {salvando ? "Salvando..." : produto ? "Salvar alterações" : "Adicionar produto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card de produto ────────────────────────────────────────────────
function ProdutoCard({ produto, onEditar, onExcluir, onToggleDisponivel }) {
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try {
      await onToggleDisponivel(produto.id, !produto.disponivel)
    } finally {
      setToggling(false)
    }
  }

  const precoFormatado = `R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}`

  return (
    <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden flex flex-col sm:flex-row border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors">
      {/* Imagem */}
      <div className="sm:w-28 h-32 sm:h-auto bg-[#2A2A2A] flex-shrink-0 relative">
        {produto.imagemUrl ? (
          <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {!produto.disponivel && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">Indisponível</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-white font-bold text-sm leading-tight">{produto.nome}</h4>
              {produto.categoria && (
                <span className="text-xs text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {produto.categoria.nome}
                </span>
              )}
            </div>
            <span className="text-[#3B82F6] font-bold text-sm whitespace-nowrap">{precoFormatado}</span>
          </div>
          {produto.descricao && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{produto.descricao}</p>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 pt-1">
          {/* Toggle disponibilidade */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              produto.disponivel
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
            }`}
          >
            <span>{produto.disponivel ? "✅" : "⛔"}</span>
            {toggling ? "..." : produto.disponivel ? "Disponível" : "Indisponível"}
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onEditar(produto)}
              className="p-2 rounded-xl bg-[#2A2A2A] hover:bg-[#3A3A3A] text-gray-400 hover:text-white transition-colors text-sm"
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={() => onExcluir(produto)}
              className="p-2 rounded-xl bg-[#2A2A2A] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors text-sm"
              title="Excluir"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────────
export default function GerenciarCardapio() {
  const { usuario } = useAuth()
  const restauranteId = usuario?.restauranteId

  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [produtoExcluindo, setProdutoExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [toast, setToast] = useState(null)
  const [busca, setBusca] = useState("")
  const [filtroDisp, setFiltroDisp] = useState("todos")

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo })
  }

  const carregarProdutos = async () => {
    if (!restauranteId) return
    try {
      const data = await listarProdutos(restauranteId)
      setProdutos(data)
    } catch {
      mostrarToast("Erro ao carregar produtos", "erro")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [restauranteId])

  const handleSalvar = async (acao, id, formData) => {
    if (acao === "criar") {
      const novo = await criarProduto(formData)
      setProdutos((prev) => [...prev, novo])
      mostrarToast("Produto adicionado com sucesso!")
    } else {
      const atualizado = await atualizarProduto(id, formData)
      setProdutos((prev) => prev.map((p) => (p.id === id ? atualizado : p)))
      mostrarToast("Produto atualizado!")
    }
    setModalAberto(false)
    setProdutoEditando(null)
  }

  const handleToggleDisponivel = async (id, disponivel) => {
    await alterarDisponibilidade(id, disponivel)
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, disponivel } : p))
    )
    mostrarToast(disponivel ? "Produto marcado como disponível" : "Produto marcado como indisponível")
  }

  const handleExcluir = async () => {
    if (!produtoExcluindo) return
    setExcluindo(true)
    try {
      await deletarProduto(produtoExcluindo.id)
      setProdutos((prev) => prev.filter((p) => p.id !== produtoExcluindo.id))
      mostrarToast("Produto excluído")
    } catch {
      mostrarToast("Erro ao excluir produto", "erro")
    } finally {
      setExcluindo(false)
      setProdutoExcluindo(null)
    }
  }

  // Filtros
  const produtosFiltrados = produtos.filter((p) => {
    const buscaOk = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria?.nome.toLowerCase().includes(busca.toLowerCase())
    const dispOk =
      filtroDisp === "todos" ||
      (filtroDisp === "disponiveis" && p.disponivel) ||
      (filtroDisp === "indisponiveis" && !p.disponivel)
    return buscaOk && dispOk
  })

  const qtdDisponiveis = produtos.filter((p) => p.disponivel).length
  const qtdIndisponiveis = produtos.filter((p) => !p.disponivel).length

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-10">
      {/* Toast */}
      {toast && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal formulário */}
      {modalAberto && (
        <FormularioProduto
          produto={produtoEditando}
          restauranteId={restauranteId}
          onSalvar={handleSalvar}
          onCancelar={() => {
            setModalAberto(false)
            setProdutoEditando(null)
          }}
        />
      )}

      {/* Modal confirmação exclusão */}
      {produtoExcluindo && (
        <ModalConfirmacao
          produto={produtoExcluindo}
          onConfirmar={handleExcluir}
          onCancelar={() => setProdutoExcluindo(null)}
          carregando={excluindo}
        />
      )}

      {/* Header */}
      <header className="bg-[#181818] px-4 py-4 border-b border-[#2A2A2A] sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🍽️ Cardápio</h1>
            <p className="text-gray-500 text-xs mt-0.5">{produtos.length} produto{produtos.length !== 1 ? "s" : ""} cadastrado{produtos.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => {
              setProdutoEditando(null)
              setModalAberto(true)
            }}
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white px-4 py-2 rounded-full text-sm font-bold transition-colors active:scale-95"
          >
            <span>+</span> Novo produto
          </button>
        </div>
      </header>

      <div className="px-4 pt-5">
        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total", valor: produtos.length, icon: "📦", cor: "text-white" },
            { label: "Disponíveis", valor: qtdDisponiveis, icon: "✅", cor: "text-green-400" },
            { label: "Indisponíveis", valor: qtdIndisponiveis, icon: "⛔", cor: "text-red-400" },
          ].map((c) => (
            <div key={c.label} className="bg-[#1E1E1E] rounded-2xl p-3 flex flex-col items-center gap-1 border border-[#2A2A2A]">
              <span className="text-xl">{c.icon}</span>
              <span className={`text-xl font-bold ${c.cor}`}>{c.valor}</span>
              <span className="text-gray-500 text-xs">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Busca + filtro */}
        <div className="flex gap-3 mb-4">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto ou categoria..."
            className="flex-1 bg-[#1E1E1E] border border-[#2A2A2A] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] placeholder:text-gray-600"
          />
          <select
            value={filtroDisp}
            onChange={(e) => setFiltroDisp(e.target.value)}
            className="bg-[#1E1E1E] border border-[#2A2A2A] text-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6]"
          >
            <option value="todos">Todos</option>
            <option value="disponiveis">Disponíveis</option>
            <option value="indisponiveis">Indisponíveis</option>
          </select>
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1E1E1E] rounded-2xl h-28 animate-pulse border border-[#2A2A2A]" />
            ))}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-16 text-center">
            <span className="text-6xl">{busca || filtroDisp !== "todos" ? "🔍" : "🍽️"}</span>
            <p className="text-white font-bold text-lg">
              {busca || filtroDisp !== "todos" ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </p>
            <p className="text-gray-400 text-sm">
              {busca || filtroDisp !== "todos"
                ? "Tente outros termos ou filtros"
                : "Clique em \"Novo produto\" para começar"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onEditar={(p) => {
                  setProdutoEditando(p)
                  setModalAberto(true)
                }}
                onExcluir={(p) => setProdutoExcluindo(p)}
                onToggleDisponivel={handleToggleDisponivel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
