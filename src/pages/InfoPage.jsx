import { useSiteSettings } from '../SiteContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './InfoPage.css';

import { Mail, Phone, MapPin, Clock, Truck, ShieldCheck, HelpCircle } from 'lucide-react';

function InfoPage({ title, type }) {
  const { settings } = useSiteSettings();

  const renderContent = () => {
    if (type === 'faq') {
      return (
        <div className="faq-list">
          {settings.faq && settings.faq.length > 0 ? (
            settings.faq.map((item, i) => (
              <div key={i} className="faq-item">
                <h3><HelpCircle size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--color-primary)' }} /> {item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-muted">No frequently asked questions available yet.</p>
          )}
        </div>
      );
    }

    if (type === 'shipping') {
      return (
        <div className="policy-container">
          <div className="policy-section">
            <h2><Truck size={24} style={{ color: 'var(--color-primary)' }} /> Shipping Policy</h2>
            <p>{settings.shippingPolicy || 'Standard shipping takes 3-5 business days across Pakistan.'}</p>
            <div className="estimate-badge">
              <Clock size={18} /> Estimated Delivery: {settings.deliveryEstimate || '3-5 business days'}
            </div>
          </div>
          
          <div className="policy-section" style={{ marginTop: '3rem' }}>
            <h2><ShieldCheck size={24} style={{ color: 'var(--color-primary)' }} /> Returns & Exchanges</h2>
            <p>{settings.returnPolicy || 'We offer a 7-day easy return policy for unused items in original packaging.'}</p>
          </div>
        </div>
      );
    }

    if (type === 'contact') {
      return (
        <div className="contact-grid">
          <div className="contact-info-item">
            <h4><Mail size={16} /> Email Us</h4>
            <p>{settings.contactEmail || 'support@zauqbedding.com'}</p>
          </div>
          <div className="contact-info-item">
            <h4><Phone size={16} /> Call / WhatsApp</h4>
            <p>{settings.contactPhone || settings.whatsappNumber || '+92 300 1234567'}</p>
          </div>
          <div className="contact-info-item">
            <h4><MapPin size={16} /> Our Location</h4>
            <p>{settings.contactAddress || 'Karachi, Pakistan'}</p>
          </div>
          <div className="contact-info-item">
            <h4><Clock size={16} /> Working Hours</h4>
            <p>{settings.contactWorkingHours || 'Mon - Sat: 10:00 AM - 08:00 PM'}</p>
          </div>
        </div>
      );
    }

    return <p>Content coming soon.</p>;
  };

  return (
    <div className="info-page">
      <div className="info-hero">
        <div className="container">
          <Link to="/" className="info-back-link">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="container">
        <div className="info-card">
          <div className="info-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
