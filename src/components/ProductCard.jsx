import { ShoppingCart } from 'lucide-react';
import './ProductCard.css';

function ProductCard({ product }) {
  return (
    <div className="product-card group">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        <div className="product-badges">
          <span className={`badge ${product.condition === 'New' ? 'badge-new' : 'badge-preloved'}`}>
            {product.condition}
          </span>
        </div>
        <div className="product-actions">
          <button className="btn btn-primary add-to-cart-btn">
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <p className="product-category text-muted">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price}</p>
      </div>
    </div>
  );
}

export default ProductCard;
