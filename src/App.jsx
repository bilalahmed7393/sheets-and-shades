import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Admin from './pages/Admin'
import InfoPage from './pages/InfoPage'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'

function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const [showCheckout, setShowCheckout] = useState(false)

  return (
    <div className="app">
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartDrawer onCheckout={() => setShowCheckout(true)} />}
      {!isAdmin && <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/faq" element={<InfoPage title="Frequently Asked Questions" contentKey="faqContent" />} />
          <Route path="/shipping" element={<InfoPage title="Shipping & Returns" contentKey="shippingContent" />} />
          <Route path="/contact" element={<InfoPage title="Contact Us" contentKey="contactContent" />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default App
