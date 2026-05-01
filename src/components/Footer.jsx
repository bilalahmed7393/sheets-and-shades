import { useSiteSettings } from '../SiteContext';
import './Footer.css';

function Footer() {
  const { settings } = useSiteSettings();
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h3>{settings.siteName}</h3>
          <p className="text-muted">{settings.aboutText}</p>
        </div>
        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li><a href="/shop?category=bedsheets">Bedsheets</a></li>
            <li><a href="/shop?category=curtains">Curtains</a></li>
            <li><a href="/shop?condition=pre-loved">Pre-loved</a></li>
            <li><a href="/shop?condition=new">New Arrivals</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">Contact Us</a></li>
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
