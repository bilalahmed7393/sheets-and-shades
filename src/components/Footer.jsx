import { Link } from 'react-router-dom';
import { useSiteSettings } from '../SiteContext';
import './Footer.css';

function Footer() {
  const { settings } = useSiteSettings();
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h3>{settings.siteName || 'ZAUQ'}</h3>
          <p className="text-muted">{settings.siteTagline || 'Premium bedding and curtains for your home.'}</p>
        </div>
        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop?category=bedsheets">Bedsheets</Link></li>
            <li><Link to="/shop?category=curtains">Curtains</Link></li>
            <li><Link to="/shop?condition=pre-loved">Pre-loved</Link></li>
            <li><Link to="/shop?condition=new">New Arrivals</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Shipping & Returns</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="text-muted">&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
