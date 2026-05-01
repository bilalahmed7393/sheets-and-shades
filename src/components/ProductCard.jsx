import { ShoppingCart } from 'lucide-react';
import { useCart } from '../CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="product-card group">
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
        <div className="product-actions">
          <button className="btn btn-primary add-to-cart-btn" onClick={() => addToCart(product)}>
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <p className="product-category text-muted">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="price-container">
          {product.salePrice > 0 ? (
            <>
              <span className="product-price sale-price">PKR {product.salePrice.toLocaleString()}</span>
              <span className="product-price original-price">PKR {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="product-price">PKR {product.price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
