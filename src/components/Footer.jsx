import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h3>Sheets <span>&</span> Shades</h3>
          <p className="text-muted">Premium quality bedsheets and curtains for every home. Discover our curated collection of new and pre-loved home decor.</p>
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
        <p className="text-muted">&copy; {new Date().getFullYear()} Sheets & Shades. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
