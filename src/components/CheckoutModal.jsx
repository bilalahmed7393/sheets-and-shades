import { useState } from 'react';
import { X, CheckCircle, Truck } from 'lucide-react';
import { useCart } from '../CartContext';
import './CheckoutModal.css';

function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, cartTotal, setIsCartOpen } = useCart();
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', zip: ''
  });

  const clearCartAndClose = () => {
    // Clear cart from localStorage and reload
    localStorage.removeItem('shopping_cart');
    window.location.reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="checkout-overlay" onClick={onClose} />
      <div className="checkout-modal">
        {step === 'form' ? (
          <>
            <div className="checkout-header">
              <h2>Checkout</h2>
              <button className="checkout-close" onClick={onClose}><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="checkout-body">
              {/* Order Summary */}
              <div className="checkout-summary">
                <h3>Order Summary</h3>
                {cartItems.map(item => (
                  <div key={item.id} className="checkout-summary-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p className="checkout-item-name">{item.name}</p>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="checkout-summary-total">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Form */}
              <div className="checkout-section">
                <h3><Truck size={18} /> Shipping Details</h3>
                <div className="checkout-form-grid">
                  <div className="checkout-field full">
                    <label>Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
                  </div>
                  <div className="checkout-field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" required />
                  </div>
                  <div className="checkout-field">
                    <label>Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 123-4567" required />
                  </div>
                  <div className="checkout-field full">
                    <label>Address</label>
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main Street" required />
                  </div>
                  <div className="checkout-field">
                    <label>City</label>
                    <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="New York" required />
                  </div>
                  <div className="checkout-field">
                    <label>ZIP Code</label>
                    <input type="text" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} placeholder="10001" required />
                  </div>
                </div>
              </div>

              <button type="submit" className="checkout-place-order-btn">
                Place Order — ${cartTotal.toFixed(2)}
              </button>
            </form>
          </>
        ) : (
          <div className="checkout-success">
            <div className="checkout-success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Order Confirmed!</h2>
            <p>Thank you, <strong>{form.name}</strong>! Your order of <strong>${cartTotal.toFixed(2)}</strong> has been placed successfully.</p>
            <p className="checkout-success-sub">We'll send a confirmation email to <strong>{form.email}</strong> with your tracking details.</p>
            <button className="btn btn-primary" onClick={clearCartAndClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CheckoutModal;
