import { useSiteSettings } from '../SiteContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './InfoPage.css';

function InfoPage({ title, contentKey }) {
  const { settings } = useSiteSettings();
  const content = settings[contentKey] || '<p>Content coming soon.</p>';

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
          <div className="info-content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
