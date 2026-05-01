export const defaultProducts = [
  {
    id: 1,
    name: "Egyptian Cotton Percale Sheet Set",
    category: "Bedsheets",
    condition: "New",
    price: 120,
    image: "https://images.unsplash.com/photo-1522771731478-40b95bc8e4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Crisp, cool, and breathable 400-thread-count Egyptian cotton."
  },
  {
    id: 2,
    name: "Vintage Linen Duvet Cover",
    category: "Bedsheets",
    condition: "Pre-loved",
    price: 65,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Softened over time, this pre-loved linen cover adds rustic charm."
  },
  {
    id: 3,
    name: "Opaque Velvet Blackout Curtains",
    category: "Curtains",
    condition: "New",
    price: 85,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Luxurious velvet panels that block 99% of light."
  },
  {
    id: 4,
    name: "Sheer Voile Drapes",
    category: "Curtains",
    condition: "Pre-loved",
    price: 25,
    image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Gently used sheer panels, perfect for filtering soft morning light."
  },
  {
    id: 5,
    name: "Silk Pillowcase Pair",
    category: "Bedsheets",
    condition: "New",
    price: 50,
    image: "https://images.unsplash.com/photo-1616137466211-f939a420be84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "100% Mulberry silk for the ultimate beauty sleep."
  },
  {
    id: 6,
    name: "Boho Macrame Curtain",
    category: "Curtains",
    condition: "Pre-loved",
    price: 40,
    image: "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted macrame backdrop, slightly weathered for a vintage look."
  }
];

const STORAGE_KEY = 'sheets_and_shades_products';

/**
 * Get all products. Reads from localStorage first, falls back to defaults.
 */
export function getProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to read products from localStorage:', e);
  }
  return [...defaultProducts];
}

/**
 * Save the full product array to localStorage.
 */
export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage:', e);
  }
}

/**
 * Generate the next available product ID.
 */
export function getNextId(products) {
  if (products.length === 0) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

/**
 * Export products as a downloadable JSON file.
 */
export function exportProducts() {
  const products = getProducts();
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sheets-and-shades-catalog-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import products from a JSON file. Returns a promise that resolves with the imported products.
 */
export function importProducts(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const products = JSON.parse(e.target.result);
        if (!Array.isArray(products)) {
          reject(new Error('Invalid format: expected an array of products.'));
          return;
        }
        saveProducts(products);
        resolve(products);
      } catch (err) {
        reject(new Error('Invalid JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Reset products back to defaults.
 */
export function resetProducts() {
  localStorage.removeItem(STORAGE_KEY);
}
