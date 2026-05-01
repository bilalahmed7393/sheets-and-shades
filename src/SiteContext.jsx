import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from './data';

const SiteContext = createContext();

function applyThemeColors(settings) {
  const root = document.documentElement;
  if (settings.primaryColor) {
    root.style.setProperty('--color-primary', settings.primaryColor);
    // Darken primary for hover state
    root.style.setProperty('--color-primary-hover', darkenColor(settings.primaryColor, 15));
  }
  if (settings.secondaryColor) {
    root.style.setProperty('--color-secondary', settings.secondaryColor);
  }
  if (settings.backgroundColor) {
    root.style.setProperty('--color-background', settings.backgroundColor);
  }
  if (settings.textColor) {
    root.style.setProperty('--color-text', settings.textColor);
    // Lighter version for muted text
    root.style.setProperty('--color-text-light', lightenColor(settings.textColor, 30));
  }
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00FF) + amt, 255);
  const B = Math.min((num & 0x0000FF) + amt, 255);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({
    siteName: 'ZAUQ Bedding & More',
    heroHeadline: 'Curated Comfort for Your Home',
    heroSubtitle: 'Discover our premium collection of pre-loved and new bedsheets and curtains.',
    aboutText: 'A marketplace for premium bedsheets and curtains.',
    logoImage: '',
    heroBackgroundImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    categoryImage1: 'https://images.unsplash.com/photo-1522771731478-40b95bc8e4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    categoryImage2: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    primaryColor: '#8b7355',
    secondaryColor: '#8f9779',
    backgroundColor: '#faf9f6',
    textColor: '#2c302e',
    faqContent: '',
    shippingContent: '',
    contactContent: ''
  });

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        setSettings(data);
        if (data.siteName) {
          document.title = data.siteName;
        }
        applyThemeColors(data);
      }
    });
  }, []);

  const updateLocalSettings = (newSettings) => {
    setSettings(newSettings);
    if (newSettings.siteName) {
      document.title = newSettings.siteName;
    }
    applyThemeColors(newSettings);
  };

  return (
    <SiteContext.Provider value={{ settings, updateLocalSettings }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteContext);
}
