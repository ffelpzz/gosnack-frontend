// src/pages/cliente/Login.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { User, Mail, Lock, Phone, CreditCard } from "lucide-react"
import logo from "/src/assets/logos/logoquk.png"

export default function Login() {
  const [modoCadastro, setModoCadastro] = useState(false)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [cpf, setCpf] = useState("")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")

  const { login, cadastro } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !senha) { setErro("Preencha email e senha"); return }
    setErro(""); setCarregando(true)
    try {
      const usuario = await login(email, senha)
      if (usuario.role === "admin") navigate("/admin/restaurantes")
      else if (usuario.role === "restaurante") navigate(`/restaurante/painel/${usuario.restauranteId}`)
      else navigate("/")
    } catch (err) {
      setErro(err.response?.data?.erro || "Email ou senha inválidos")
    } finally { setCarregando(false) }
  }

  const handleCadastro = async () => {
    if (!cpf || !nome || !email || !telefone || !senha) { setErro("Preencha todos os campos"); return }
    setErro(""); setCarregando(true)
    try {
      await cadastro(nome, email, senha, cpf, telefone)
      navigate("/")
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar conta. Tente outro email.")
    } finally { setCarregando(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#121212] text-white">
      <div className="w-full max-w-md rounded-3xl px-8 py-6 my-6 bg-[#1E1E1E] shadow-xl">

        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-16 mb-4" />
          <h1 className="font-bold text-3xl">{modoCadastro ? "Criar conta" : "Bem-vindo"}</h1>
          <p className="text-sm mt-2 text-gray-400">
            {modoCadastro ? "Crie sua conta para continuar" : "Faça login para continuar"}
          </p>
        </div>

        {erro && (
          <div className="mb-4 text-center text-sm py-3 rounded-2xl bg-red-500/10 text-red-400">{erro}</div>
        )}

        {modoCadastro ? (
          <>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-4 bg-[#2A2A2A]">
              <CreditCard size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Digite seu CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-4 bg-[#2A2A2A]">
              <User size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Digite seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-4 bg-[#2A2A2A]">
              <Mail size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-4 bg-[#2A2A2A]">
              <Phone size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Digite seu telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-4 bg-[#2A2A2A]">
              <Lock size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>

            <button onClick={handleCadastro} disabled={carregando} className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-95 transition-all duration-150 shadow-md disabled:opacity-60">
              {carregando ? "Criando conta..." : "Cadastrar"}
            </button>
            <p className="text-center text-sm mt-5 text-gray-400">
              Já tem conta?{" "}
              <button onClick={() => { setErro(""); setModoCadastro(false) }} className="font-semibold text-[#3B82F6]">Entrar</button>
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-4 bg-[#2A2A2A]">
              <Mail size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 bg-[#2A2A2A]">
              <Lock size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
              <input type="password" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full bg-transparent outline-none text-white placeholder-gray-400" />
            </div>

            <button onClick={handleLogin} disabled={carregando} className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-95 transition-all duration-150 shadow-md disabled:opacity-60">
              {carregando ? "Entrando..." : "Entrar"}
            </button>
            <p className="text-center text-sm mt-5 text-gray-400">
              Não tem conta?{" "}
              <button onClick={() => { setErro(""); setModoCadastro(true) }} className="font-semibold text-[#3B82F6]">Cadastre-se</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
