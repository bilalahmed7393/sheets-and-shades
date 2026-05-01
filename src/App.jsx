import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Admin from './pages/Admin'
import CartDrawer from './components/CartDrawer'

function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <div className="app">
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartDrawer />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default App
