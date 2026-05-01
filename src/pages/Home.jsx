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

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  if (featuredProducts.length === 0) featuredProducts.push(...products.slice(0, 4));

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
              <Link to={settings.heroCta1Link || "/shop"} className="btn btn-primary">
                {settings.heroCta1Text || "Shop Collection"} <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      {settings.showTrustBar !== false && (
        <section className="trust-bar">
          <div className="container">
            <div className="trust-items">
              {settings.showTrustItem1 !== false && (
                <div className="trust-item">
                  <div className="trust-icon"><Truck size={22} /></div>
                  <div className="trust-text">
                    <h4>{settings.trustItem1Title || 'Free Shipping'}</h4>
                    <p>{settings.trustItem1Desc || `On orders above PKR ${settings.shippingFreeThreshold || '3,000'}`}</p>
                  </div>
                </div>
              )}
              {settings.showTrustItem2 !== false && (
                <div className="trust-item">
                  <div className="trust-icon"><Shield size={22} /></div>
                  <div className="trust-text">
                    <h4>{settings.trustItem2Title || 'Quality Guarantee'}</h4>
                    <p>{settings.trustItem2Desc || 'Premium fabrics only'}</p>
                  </div>
                </div>
              )}
              {settings.showTrustItem3 !== false && (
                <div className="trust-item">
                  <div className="trust-icon"><RefreshCw size={22} /></div>
                  <div className="trust-text">
                    <h4>{settings.trustItem3Title || 'Easy Returns'}</h4>
                    <p>{settings.trustItem3Desc || '7-day return policy'}</p>
                  </div>
                </div>
              )}
              {settings.showTrustItem4 !== false && (
                <div className="trust-item">
                  <div className="trust-icon"><Headphones size={22} /></div>
                  <div className="trust-text">
                    <h4>{settings.trustItem4Title || 'Support'}</h4>
                    <p>{settings.trustItem4Desc || "We're here to help"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories container">
        <div className="category-card">
          <img src={settings.categoryImage1} alt="Bedsheets" />
          <div className="category-overlay">
            <h3>Luxury Bedsheets</h3>
            <Link to="/shop?category=Bedsheets" className="btn btn-outline btn-light">Shop Sheets</Link>
          </div>
        </div>
        <div className="category-card">
          <img src={settings.categoryImage2} alt="Curtains" />
          <div className="category-overlay">
            <h3>Elegant Curtains</h3>
            <Link to="/shop?category=Curtains" className="btn btn-outline btn-light">Shop Curtains</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products container">
        <div className="section-header">
          <div>
            <h2>Featured Collection</h2>
            <p className="section-subtitle">Handpicked premium items just for you</p>
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
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div className="cta-banner">
          <h2>Comfort Meets Style</h2>
          <p>{settings.aboutText?.substring(0, 150) || "Explore our curated collection of premium bedding and curtains for your dream home."}...</p>
          <Link to="/shop" className="btn">Browse Collection</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
