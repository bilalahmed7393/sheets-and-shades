import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from './data';

const SiteContext = createContext();

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({
    siteName: 'Sheets & Shades',
    heroHeadline: 'Curated Comfort for Your Home',
    heroSubtitle: 'Discover our premium collection of pre-loved and new bedsheets and curtains.',
    aboutText: 'A marketplace for premium bedsheets and curtains.',
    logoImage: '',
    heroBackgroundImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    categoryImage1: 'https://images.unsplash.com/photo-1522771731478-40b95bc8e4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    categoryImage2: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        setSettings(data);
        if (data.siteName) {
          document.title = data.siteName;
        }
      }
    });
  }, []);

  const updateLocalSettings = (newSettings) => {
    setSettings(newSettings);
    if (newSettings.siteName) {
      document.title = newSettings.siteName;
    }
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
