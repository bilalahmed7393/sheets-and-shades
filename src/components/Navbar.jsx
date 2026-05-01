import { Link } from 'react-router-dom';
import { ShoppingBag, Menu } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar glass-panel">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          Sheets <span className="ampersand">&</span> Shades
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop All</Link>
          <Link to="/shop?category=bedsheets">Bedsheets</Link>
          <Link to="/shop?category=curtains">Curtains</Link>
          <Link to="/shop?condition=pre-loved" className="highlight-link">Pre-loved</Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn">
            <ShoppingBag size={24} strokeWidth={1.5} />
            <span className="cart-badge">0</span>
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
