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

const API_BASE = '/api/products';

/**
 * Fetch all products from the backend.
 */
export async function getProducts() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.length > 0 ? data : [...defaultProducts];
  } catch (e) {
    console.error('API Fetch Error:', e);
    return [...defaultProducts];
  }
}

/**
 * Add a new product to the backend.
 */
export async function addProduct(product) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to add product');
  return res.json();
}

/**
 * Update a product on the backend.
 */
export async function updateProduct(product) {
  const res = await fetch(`${API_BASE}/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

/**
 * Delete a product on the backend.
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
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
export async function exportProducts() {
  const products = await getProducts();
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
 * Import products from a JSON file.
 */
export function importProducts(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const products = JSON.parse(e.target.result);
        if (!Array.isArray(products)) {
          reject(new Error('Invalid format: expected an array of products.'));
          return;
        }
        const res = await fetch(`${API_BASE}/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products)
        });
        if (!res.ok) throw new Error('Failed to batch import products');
        const saved = await res.json();
        resolve(saved);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Reset products back to defaults (client-side only for demo purposes)
 */
export async function resetProducts() {
  await fetch(`${API_BASE}/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultProducts)
  });
}

/**
 * Fetch settings from the backend.
 */
export async function getSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (e) {
    console.error('API Fetch Error:', e);
    return {
      siteName: 'ZAUQ Bedding & More',
      heroHeadline: 'Curated Comfort for Your Home',
      heroSubtitle: 'Discover our premium collection of pre-loved and new bedsheets and curtains.',
      aboutText: 'A marketplace for premium bedsheets and curtains.'
    };
  }
}

/**
 * Update settings on the backend.
 */
export async function updateSettings(settings) {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}
