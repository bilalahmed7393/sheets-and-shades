import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../data';
import './Shop.css';

function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialCondition = searchParams.get('condition');

  const products = getProducts();
  const [filterCategory, setFilterCategory] = useState(initialCategory || 'All');
  const [filterCondition, setFilterCondition] = useState(initialCondition || 'All');

  useEffect(() => {
    if (initialCategory) setFilterCategory(initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1));
    if (initialCondition) {
      if (initialCondition === 'pre-loved') setFilterCondition('Pre-loved');
      if (initialCondition === 'new') setFilterCondition('New');
    }
  }, [initialCategory, initialCondition]);

  const filteredProducts = products.filter(product => {
    const categoryMatch = filterCategory === 'All' || product.category === filterCategory;
    const conditionMatch = filterCondition === 'All' || product.condition === filterCondition;
    return categoryMatch && conditionMatch;
  });

  return (
    <div className="shop-page container">
      <div className="shop-header">
        <h1>Our Collection</h1>
        <p className="text-muted">Browse our hand-picked selection of beautiful bedsheets and curtains.</p>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">
              <SlidersHorizontal size={18} /> Filters
            </h3>
          </div>
          
          <div className="filter-group">
            <h4>Category</h4>
            <div className="filter-options">
              {['All', 'Bedsheets', 'Curtains'].map(cat => (
                <label key={cat} className="filter-label">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={filterCategory === cat}
                    onChange={() => setFilterCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Condition</h4>
            <div className="filter-options">
              {['All', 'New', 'Pre-loved'].map(cond => (
                <label key={cond} className="filter-label">
                  <input 
                    type="radio" 
                    name="condition" 
                    checked={filterCondition === cond}
                    onChange={() => setFilterCondition(cond)}
                  />
                  <span>{cond}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="shop-content">
          <div className="results-count">
            Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p className="text-muted">Try adjusting your filters to see more results.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setFilterCategory('All');
                  setFilterCondition('All');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Shop;
