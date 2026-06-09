// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Páginas cliente
import Login from "../pages/cliente/Login"
import Home from "../pages/cliente/Home"
import Carrinho from "../pages/cliente/Carrinho"
import MeusPedidos from "../pages/cliente/MeusPedidos"
import Restaurante from "../pages/cliente/Restaurante"
import StatusPedido from "../pages/cliente/StatusPedido"
import Perfil from "../pages/cliente/Perfil"
import Configuracoes from "../pages/cliente/Configuracoes"

// Painel restaurante (inclui abas Pedidos + Cardápio)
import PainelRestaurante from "../pages/restaurante/PainelRestaurante"
import GerenciarCardapio from "../pages/restaurante/GerenciarCardapio"

// Páginas admin
import AdminRestaurantes from "../pages/admin/AdminRestaurantes"
import AdminUsuarios from "../pages/admin/AdminUsuarios"

function RotaProtegida({ children, roles }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/" />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Cliente */}
      <Route path="/" element={
        <RotaProtegida roles={["cliente"]}>
          <Home />
        </RotaProtegida>
      } />
      <Route path="/restaurante/:id" element={
        <RotaProtegida roles={["cliente"]}>
          <Restaurante />
        </RotaProtegida>
      } />
      <Route path="/carrinho" element={
        <RotaProtegida roles={["cliente"]}>
          <Carrinho />
        </RotaProtegida>
      } />
      <Route path="/meus-pedidos" element={
        <RotaProtegida roles={["cliente"]}>
          <MeusPedidos />
        </RotaProtegida>
      } />
      <Route path="/pedido/:id" element={
        <RotaProtegida roles={["cliente"]}>
          <StatusPedido />
        </RotaProtegida>
      } />

      {/* Restaurante — painel com abas Pedidos + Cardápio */}
      <Route path="/restaurante/painel/:id" element={
        <RotaProtegida roles={["restaurante", "RESTAURANTE", "admin", "ADMIN"]}>
          <PainelRestaurante />
        </RotaProtegida>
      } />
      {/* Rota direta para cardápio (opcional, navegação direta) */}
      <Route path="/restaurante/cardapio/:id" element={
        <RotaProtegida roles={["restaurante", "RESTAURANTE", "admin", "ADMIN"]}>
          <GerenciarCardapio />
        </RotaProtegida>
      } />

      {/* Admin */}
      <Route path="/admin/restaurantes" element={
        <RotaProtegida roles={["admin", "ADMIN"]}>
          <AdminRestaurantes />
        </RotaProtegida>
      } />
      <Route path="/admin/usuarios" element={
        <RotaProtegida roles={["admin", "ADMIN"]}>
          <AdminUsuarios />
        </RotaProtegida>
      } />

      <Route path="/perfil" element={
        <RotaProtegida roles={["cliente"]}>
          <Perfil />
        </RotaProtegida>
      } />

      <Route path="/configuracoes" element={
        <RotaProtegida roles={["cliente", "restaurante", "RESTAURANTE", "admin", "ADMIN"]}>
          <Configuracoes />
        </RotaProtegida>
      } />
    </Routes>
  )
}
