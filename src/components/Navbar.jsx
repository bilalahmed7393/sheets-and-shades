import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Home, Store, Heart, HelpCircle, Truck, Phone, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../SiteContext';
import { useCart } from '../CartContext';
import './Navbar.css';

function Navbar() {
  const { settings } = useSiteSettings();
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Build the WhatsApp URL safely
  const whatsappDigits = (settings.whatsappNumber || '').replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappDigits}`;

  return (
    <>
      {settings.showAnnouncement && (
        <div 
          className="announcement-bar" 
          style={{ 
            background: settings.announcementBgColor || settings.primaryColor || '#2d6a4f',
            color: settings.announcementTextColor || '#ffffff',
            fontSize: settings.announcementFontSize || '0.8rem',
            padding: settings.announcementPadding || '8px 0'
          }}
        >
          <div className="container">
            <p>{settings.announcementText || 'Free delivery on orders over PKR 5000!'}</p>
          </div>
        </div>
      )}
      <header 
        className="navbar" 
        style={{ 
          height: settings.navbarHeight || '76px',
          background: settings.navbarBgColor || 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <div className="container navbar-content">
          <Link to="/" className="brand">
            {settings.logoImage && (
              <img 
                src={settings.logoImage} 
                alt={settings.siteName} 
                className="brand-logo" 
                style={{ height: settings.logoHeight || '64px' }}
              />
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

      {/* WhatsApp Floating Button */}
      {settings.showWhatsApp && (
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="whatsapp-float"
          aria-label="Contact on WhatsApp"
        >
          <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
            <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.905 15.905 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.338 22.594c-.39 1.1-1.932 2.014-3.166 2.28-.844.18-1.946.324-5.658-1.216-4.75-1.968-7.806-6.79-8.04-7.104-.226-.314-1.886-2.512-1.886-4.79s1.194-3.4 1.618-3.866c.424-.466.924-.582 1.232-.582.308 0 .616.002.886.016.284.014.666-.108 1.042.794.39.934 1.324 3.232 1.44 3.466.116.234.194.506.038.82-.156.314-.232.51-.466.786-.232.274-.49.612-.698.822-.232.234-.474.488-.204.958.272.47 1.208 1.992 2.594 3.228 1.782 1.588 3.282 2.08 3.75 2.314.468.234.742.194 1.014-.116.274-.312 1.168-1.356 1.48-1.822.31-.466.62-.39 1.048-.234.428.156 2.726 1.286 3.194 1.52.468.234.78.35.894.544.116.194.116 1.126-.274 2.226z"/>
          </svg>
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
