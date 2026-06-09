// src/pages/cliente/Perfil.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Header from "../../components/Header"
import BottomNav from "../../components/BottomNav"
import { User, Mail, Phone, CheckCircle } from "lucide-react"
import api from "../../services/api"

export default function Perfil() {
    const { usuario, atualizarUsuario } = useAuth()
    const navigate = useNavigate()

    const [nome, setNome] = useState(usuario?.nome || "")
    const [email] = useState(usuario?.email || "")
    const [telefone, setTelefone] = useState(usuario?.telefone || "")

    const [salvando, setSalvando] = useState(false)
    const [sucesso, setSucesso] = useState(false)
    const [erro, setErro] = useState("")

    const handleSalvar = async () => {
        if (!nome.trim()) {
            setErro("O nome não pode ficar vazio.")
            return
        }
        setErro("")
        setSucesso(false)
        setSalvando(true)
        try {
            await api.patch("/auth/perfil", { nome, telefone })
            atualizarUsuario({ nome, telefone })
            setSucesso(true)
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao salvar. Tente novamente.")
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white pb-24">
            <Header />

            <div className="px-4 pt-6 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-center mb-8">Meu Perfil</h1>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-[#3B82F6]/20 border-2 border-[#3B82F6]/40 flex items-center justify-center mb-3">
                        <User size={40} strokeWidth={1.5} className="text-[#3B82F6]" />
                    </div>
                    <p className="text-white font-bold text-lg">{usuario?.nome}</p>
                    <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#3B82F6]/20 text-[#3B82F6] capitalize">
                        {usuario?.role}
                    </span>
                </div>

                {sucesso && (
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm py-3 rounded-2xl bg-green-500/10 text-green-400">
                        <CheckCircle size={16} />
                        Perfil atualizado com sucesso!
                    </div>
                )}
                {erro && (
                    <div className="mb-4 text-center text-sm py-3 rounded-2xl bg-red-500/10 text-red-400">
                        {erro}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block pl-1">Nome</label>
                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#1E1E1E]">
                            <User size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
                            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-transparent outline-none text-white placeholder-gray-500" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block pl-1">Email (não editável)</label>
                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#1E1E1E] opacity-60">
                            <Mail size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
                            <input type="email" value={email} disabled className="w-full bg-transparent outline-none text-white cursor-not-allowed" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block pl-1">Telefone</label>
                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#1E1E1E]">
                            <Phone size={16} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
                            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="w-full bg-transparent outline-none text-white placeholder-gray-500" />
                        </div>
                    </div>
                </div>

                <button onClick={handleSalvar} disabled={salvando} className="w-full mt-8 py-4 rounded-2xl text-white font-bold text-lg bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-95 transition-all duration-150 shadow-md disabled:opacity-60">
                    {salvando ? "Salvando..." : "Salvar alterações"}
                </button>

                <button onClick={() => navigate(-1)} className="w-full mt-3 py-3 rounded-2xl text-gray-400 font-semibold bg-[#1E1E1E] hover:bg-[#2A2A2A] transition-all">
                    Voltar
                </button>
            </div>

            <BottomNav />
        </div>
    )
}
