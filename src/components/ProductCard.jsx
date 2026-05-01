import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../CartContext';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="product-card group">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
          <div className="product-badges">
            {product.badge && product.badge !== 'None' && (
              <span className="badge badge-featured">
                {product.badge}
              </span>
            )}
            <span className={`badge ${product.condition === 'New' ? 'badge-new' : 'badge-preloved'}`}>
              {product.condition}
            </span>
          </div>
          <div className="product-overlay">
            <div className="view-details">
              <Eye size={20} />
              <span>View Details</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="product-info">
        <p className="product-category text-muted">{product.category}</p>
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="price-container">
          <div className="price-group">
            {product.salePrice > 0 ? (
              <>
                <span className="product-price sale-price">PKR {product.salePrice.toLocaleString()}</span>
                <span className="product-price original-price">PKR {product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="product-price">PKR {product.price.toLocaleString()}</span>
            )}
          </div>
          {product.category === 'Curtains' ? (
            <Link to={`/product/${product.id}`} className="quick-add-btn" title="View Options">
              <Eye size={18} />
            </Link>
          ) : (
            <button className="quick-add-btn" onClick={() => addToCart(product)} title="Quick Add to Cart">
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
