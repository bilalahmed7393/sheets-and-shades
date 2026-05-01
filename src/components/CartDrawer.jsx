import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import './CartDrawer.css';

function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} />
              <p>Your cart is currently empty.</p>
              <button className="btn btn-primary mt-4" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <div className="cart-item-title-row">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                      <X size={16} />
                    </button>
                  </div>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  <div className="cart-quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <span className="cart-total-price">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="cart-taxes-note">Taxes and shipping calculated at checkout</p>
            <button className="btn btn-primary checkout-btn" onClick={() => alert('Checkout flow goes here!')}>
              Check out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
