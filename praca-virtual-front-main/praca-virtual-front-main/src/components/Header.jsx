import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Menu, X, User, Package, Settings, LogOut } from "lucide-react"
import logo from "/src/assets/logos/logoquk.png"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  const menuItems = [
    {
      icon: User,
      label: "Perfil",
      path: "/perfil",
      action: () => { navigate("/perfil"); setMenuOpen(false) },
    },
    {
      icon: Package,
      label: "Meus Pedidos",
      path: "/meus-pedidos",
      action: () => { navigate("/meus-pedidos"); setMenuOpen(false) },
    },
    {
      icon: Settings,
      label: "Configurações",
      path: "/configuracoes",
      action: () => { navigate("/configuracoes"); setMenuOpen(false) },
    },
  ]

  return (
    <>
      {/* Header */}
      <header className="bg-[#181818] text-white px-4 py-4 relative flex items-center">
        <button
          onClick={() => setMenuOpen(true)}
          className="text-white active:scale-95 transition z-10 p-1 rounded-lg hover:bg-white/10"
        >
          <Menu size={24} strokeWidth={1.8} />
        </button>

        <img
          src={logo}
          alt="Logo"
          className="h-16 absolute left-1/2 -translate-x-1/2"
        />
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menu lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1E1E1E] z-50 shadow-xl p-5 transition-all duration-300 ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
      >
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bold text-lg text-white">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Opções */}
        <div className="flex flex-col gap-2">
          {menuItems.map(({ icon: Icon, label, path, action }) => (
            <button
              key={path}
              onClick={action}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-150 ${isActive(path)
                  ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                  : "bg-[#2A2A2A] text-white hover:bg-[#333]"
                }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}

          {/* Sair */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all duration-150 mt-2"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  )
}
