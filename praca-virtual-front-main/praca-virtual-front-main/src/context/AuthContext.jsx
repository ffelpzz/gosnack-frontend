// src/context/AuthContext.jsx — conectado à API real
import { createContext, useContext, useState } from "react"
import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  )

  const login = async (email, senha) => {
    // Chama POST /auth/login no backend
    const { data } = await api.post("/auth/login", { email, senha })
    // data = { token, id, nome, email, role, restauranteId }
    setUsuario(data)
    localStorage.setItem("usuario", JSON.stringify(data))
    return data
  }

  const cadastro = async (nome, email, senha, cpf, telefone) => {
    // Chama POST /auth/cadastro no backend
    const { data } = await api.post("/auth/cadastro", { nome, email, senha, cpf, telefone })
    setUsuario(data)
    localStorage.setItem("usuario", JSON.stringify(data))
    return data
  }

  const atualizarUsuario = (dados) => {
    const atualizado = { ...usuario, ...dados }
    setUsuario(atualizado)
    localStorage.setItem("usuario", JSON.stringify(atualizado))
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem("usuario")
    localStorage.removeItem("carrinho")
  }

  return (
    <AuthContext.Provider value={{ usuario, login, cadastro, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
