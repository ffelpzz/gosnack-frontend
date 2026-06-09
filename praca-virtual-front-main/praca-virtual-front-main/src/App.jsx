import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import AppRoutes from "./routes/AppRoutes"
import CartDrawer from "./components/CartDrawer"

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}