import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data';
import './Home.css';

function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img 
            src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            alt="Beautiful styled bedroom" 
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text glass-panel">
            <h1>Sleep in Style. <br/>Live in Comfort.</h1>
            <p>Discover our premium collection of new and pre-loved bedsheets and curtains to elevate your home.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">
                Shop Collection <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories container">
        <div className="category-card">
          <img src="https://images.unsplash.com/photo-1522771731478-40b95bc8e4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Bedsheets" />
          <div className="category-overlay">
            <h3>Luxury Bedsheets</h3>
            <Link to="/shop?category=bedsheets" className="btn btn-outline btn-light">Shop Sheets</Link>
          </div>
        </div>
        <div className="category-card">
          <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Curtains" />
          <div className="category-overlay">
            <h3>Elegant Curtains</h3>
            <Link to="/shop?category=curtains" className="btn btn-outline btn-light">Shop Curtains</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products container">
        <div className="section-header">
          <h2>Trending Now</h2>
          <Link to="/shop" className="view-all-link">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
