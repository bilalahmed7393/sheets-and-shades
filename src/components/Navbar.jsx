import { Link } from 'react-router-dom';
import { ShoppingBag, Menu } from 'lucide-react';
import { useSiteSettings } from '../SiteContext';
import { useCart } from '../CartContext';
import './Navbar.css';

function Navbar() {
  const { settings } = useSiteSettings();
  const { cartCount, setIsCartOpen } = useCart();
  return (
    <header className="navbar glass-panel">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          {settings.logoImage ? (
            <img src={settings.logoImage} alt={settings.siteName} style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            settings.siteName
          )}
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop All</Link>
          <Link to="/shop?category=bedsheets">Bedsheets</Link>
          <Link to="/shop?category=curtains">Curtains</Link>
          <Link to="/shop?condition=pre-loved" className="highlight-link">Pre-loved</Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={24} strokeWidth={1.5} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="icon-btn mobile-menu">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
