import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../data';
import { useSiteSettings } from '../SiteContext';
import './Home.css';

function Home() {
  const { settings } = useSiteSettings();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img 
            src={settings.heroBackgroundImage} 
            alt="Hero Background" 
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text glass-panel">
            <h1>{settings.heroHeadline}</h1>
            <p>{settings.heroSubtitle}</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">
                Shop Collection <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-items">
            <div className="trust-item">
              <div className="trust-icon"><Truck size={22} /></div>
              <div className="trust-text">
                <h4>Free Shipping</h4>
                <p>On orders above PKR 3,000</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Shield size={22} /></div>
              <div className="trust-text">
                <h4>Quality Guarantee</h4>
                <p>Premium fabrics only</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><RefreshCw size={22} /></div>
              <div className="trust-text">
                <h4>Easy Returns</h4>
                <p>7-day return policy</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Headphones size={22} /></div>
              <div className="trust-text">
                <h4>Support</h4>
                <p>We're here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories container">
        <div className="category-card">
          <img src={settings.categoryImage1} alt="Bedsheets" />
          <div className="category-overlay">
            <h3>Luxury Bedsheets</h3>
            <Link to="/shop?category=bedsheets" className="btn btn-outline btn-light">Shop Sheets</Link>
          </div>
        </div>
        <div className="category-card">
          <img src={settings.categoryImage2} alt="Curtains" />
          <div className="category-overlay">
            <h3>Elegant Curtains</h3>
            <Link to="/shop?category=curtains" className="btn btn-outline btn-light">Shop Curtains</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products container">
        <div className="section-header">
          <div>
            <h2>Trending Now</h2>
            <p className="section-subtitle">Our most popular picks this season</p>
          </div>
          <Link to="/shop" className="view-all-link">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container" style={{ paddingBottom: '2rem' }}>
        <div className="cta-banner">
          <h2>Comfort Meets Style</h2>
          <p>Explore our curated collection of premium bedding and curtains for your dream home.</p>
          <Link to="/shop" className="btn">Browse Collection</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
