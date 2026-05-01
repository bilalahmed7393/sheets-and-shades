import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Home, Store, Heart, HelpCircle, Truck, Phone } from 'lucide-react';
import { useSiteSettings } from '../SiteContext';
import { useCart } from '../CartContext';
import './Navbar.css';

function Navbar() {
  const { settings } = useSiteSettings();
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      {settings.showAnnouncement && (
        <div className="announcement-bar" style={{ background: settings.primaryColor || '#2d6a4f' }}>
          <div className="container">
            <p>{settings.announcementText || 'Free delivery on orders over PKR 5000!'}</p>
          </div>
        </div>
      )}
      <header className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="brand">
            {settings.logoImage && (
              <img src={settings.logoImage} alt={settings.siteName} className="brand-logo" />
            )}
            {(!settings.logoImage || settings.siteName) && (
              <span className="brand-name">{settings.siteName || 'ZAUQ'}</span>
            )}
          </Link>
          <nav className="nav-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/shop" className={isActive('/shop')}>Shop All</Link>
            <Link to="/shop?category=Bedsheets">Bedsheets</Link>
            <Link to="/shop?category=Curtains">Curtains</Link>
            <Link to="/contact" className={isActive('/contact')}>Contact</Link>
          </nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* WhatsApp Button */}
      {settings.showWhatsApp && settings.whatsappNumber && (
        <a 
          href={`https://wa.me/${settings.whatsappNumber.replace(/\+/g, '')}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="whatsapp-float"
          aria-label="Contact on WhatsApp"
        >
          <Phone size={24} />
        </a>
      )}

      {/* Mobile Navigation */}
      {mobileOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)} />
          <nav className="mobile-nav">
            <div className="mobile-nav-header">
              <h3>{settings.siteName || 'ZAUQ'}</h3>
              <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <Link to="/" onClick={() => setMobileOpen(false)}><Home size={18} /> Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)}><Store size={18} /> Shop All</Link>
            <Link to="/shop?category=Bedsheets" onClick={() => setMobileOpen(false)}>Bedsheets</Link>
            <Link to="/shop?category=Curtains" onClick={() => setMobileOpen(false)}>Curtains</Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)}><HelpCircle size={18} /> FAQ</Link>
            <Link to="/shipping" onClick={() => setMobileOpen(false)}><Truck size={18} /> Shipping & Returns</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}><Phone size={18} /> Contact Us</Link>
          </nav>
        </>
      )}
    </>
  );
}

export default Navbar;
