import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight, Truck, ShieldCheck, RefreshCw, MessageCircle } from 'lucide-react';
import { getProducts } from '../data';
import { useCart } from '../CartContext';
import { useSiteSettings } from '../SiteContext';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customDimensions, setCustomDimensions] = useState('');

  useEffect(() => {
    getProducts().then(products => {
      const found = products.find(p => p.id === Number(id));
      setProduct(found);
      if (found) {
        setMainImage(found.image);
        if (found.sizes?.length > 0) setSelectedSize(found.sizes[0]);
        if (found.colors?.length > 0) setSelectedColor(found.colors[0]);
      }
      setLoading(false);
    });
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="loading-state">Loading product details...</div>;
  if (!product) return <div className="error-state">Product not found. <Link to="/shop">Back to Shop</Link></div>;

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      selectedSize: product.category === 'Curtains' ? customDimensions : selectedSize,
      selectedColor
    };
    addToCart(cartItem);
  };

  const images = [product.image, ...(product.images || [])];

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/shop" className="back-btn">
          <ChevronLeft size={18} /> Back to Shop
        </Link>

        <div className="product-layout">
          {/* Gallery Section */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img src={mainImage} alt={product.name} className="main-image" />
            </div>
            <div className="thumbnail-grid">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="product-info">
            <div className="info-header">
              {product.badge !== 'None' && <span className="product-badge">{product.badge}</span>}
              <h1 className="product-title">{product.name}</h1>
              <div className="product-category">{product.category}</div>
              <div className="product-price-row">
                {product.salePrice > 0 ? (
                  <>
                    <span className="sale-price">PKR {product.salePrice.toLocaleString()}</span>
                    <span className="original-price">PKR {product.price.toLocaleString()}</span>
                    <span className="discount-tag">-{Math.round((1 - product.salePrice/product.price) * 100)}%</span>
                  </>
                ) : (
                  <span className="main-price">PKR {product.price.toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="product-description">
              <p>{product.description || 'No description available for this premium item.'}</p>
            </div>

            {/* Selection Options */}
            <div className="selection-area">
              {product.category === 'Curtains' ? (
                <div className="option-group">
                  <label>Custom Dimensions (Width x Height in inches)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 54 x 84" 
                    value={customDimensions}
                    onChange={(e) => setCustomDimensions(e.target.value)}
                    className="custom-input"
                  />
                  <p className="hint-text">Enter your desired size for a custom fit.</p>
                </div>
              ) : (
                product.sizes?.length > 0 && (
                  <div className="option-group">
                    <label>Select Size</label>
                    <div className="size-chips">
                      {product.sizes.map(size => (
                        <button 
                          key={size}
                          className={`size-chip ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {product.colors?.length > 0 && (
                <div className="option-group">
                  <label>Select Color</label>
                  <div className="color-chips">
                    {product.colors.map(color => (
                      <button 
                        key={color}
                        className={`color-chip ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="actions-area">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <ShoppingBag size={20} /> Add to Cart
              </button>
              {settings.whatsappNumber && (
                <a 
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hi, I am interested in ${product.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-query-btn"
                >
                  <MessageCircle size={20} /> Inquiry via WhatsApp
                </a>
              )}
            </div>

            {/* Features/Trust Section */}
            <div className="product-features">
              <div className="feature-item">
                <Truck size={18} />
                <span>Free delivery on orders above PKR {settings.shippingFreeThreshold || '3,000'}</span>
              </div>
              <div className="feature-item">
                <ShieldCheck size={18} />
                <span>100% Quality Guarantee</span>
              </div>
              <div className="feature-item">
                <RefreshCw size={18} />
                <span>7-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
