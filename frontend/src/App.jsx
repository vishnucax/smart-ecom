import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmed from './pages/OrderConfirmed'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const [cartCount, setCartCount] = useState(0)

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Products setCartCount={setCartCount} />} />
          <Route path="/cart" element={<Cart setCartCount={setCartCount} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}