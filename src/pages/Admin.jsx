import { useState, useEffect, useRef } from 'react';
import {
  Lock, LogOut, Plus, Pencil, Trash2, Search,
  Download, Upload, RotateCcw, X, Package,
  ShoppingBag, Layers, Heart, CheckCircle, AlertCircle, Settings as SettingsIcon
} from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct, getNextId, exportProducts, importProducts, resetProducts, defaultProducts, updateSettings } from '../data';
import { useSiteSettings } from '../SiteContext';
import './Admin.css';

const ADMIN_PASSWORD = 'admin123';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('products');
  const { settings, updateLocalSettings } = useSiteSettings();
  const [settingsForm, setSettingsForm] = useState(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const [formData, setFormData] = useState({
    name: '', category: 'Bedsheets', condition: 'New',
    price: '', image: '', description: ''
  });

  useEffect(() => {
    if (isLoggedIn) {
      getProducts().then(setProducts);
    }
  }, [isLoggedIn]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsLoggedIn(false);
    setPassword('');
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      const saved = await updateSettings(settingsForm);
      updateLocalSettings(saved);
      showToast('Settings saved successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSettingsImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600; // Larger max width for hero background
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSettingsForm({ ...settingsForm, [field]: dataUrl });
      };
    };
  };

  // Modal helpers
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Bedsheets', condition: 'New', price: '', image: '', description: '' });
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData({ ...formData, image: dataUrl });
      };
    };
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      condition: product.condition,
      price: product.price.toString(),
      image: product.image,
      description: product.description
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // CRUD
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      if (editingProduct) {
        const productToUpdate = { ...editingProduct, ...formData, price: parseFloat(formData.price) };
        const updatedProduct = await updateProduct(productToUpdate);
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        showToast(`"${formData.name}" updated successfully`);
      } else {
        const newProduct = {
          id: getNextId(products),
          ...formData,
          price: parseFloat(formData.price)
        };
        const savedProduct = await addProduct(newProduct);
        setProducts([...products, savedProduct]);
        showToast(`"${formData.name}" added successfully`);
      }
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setDeleteConfirm(null);
      showToast(`"${product.name}" deleted`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Import / Export / Reset
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importProducts(file);
      setProducts(imported);
      showToast(`Imported ${imported.length} products`);
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const handleReset = async () => {
    try {
      await resetProducts();
      setProducts([...defaultProducts]);
      showToast('Catalog reset to defaults');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter products by search
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: products.length,
    bedsheets: products.filter(p => p.category === 'Bedsheets').length,
    curtains: products.filter(p => p.category === 'Curtains').length,
    preloved: products.filter(p => p.condition === 'Pre-loved').length,
  };

  // =============== LOGIN SCREEN ===============
  if (!isLoggedIn) {
    return (
      <div className="admin-layout admin-login">
        <div className="login-card">
          <div className="brand-text">Sheets <span>&</span> Shades</div>
          <h1>Admin Portal</h1>
          <p className="login-subtitle">Enter your password to manage products</p>
          <form className="login-form" onSubmit={handleLogin}>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="login-input-group">
              <Lock size={18} />
              <input
                type="password"
                className="login-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  // =============== DASHBOARD ===============
  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-brand">Sheets <span>&</span> Shades</div>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-header-right">
          <button className="admin-icon-btn" onClick={exportProducts}>
            <Download size={16} /> Export
          </button>
          <button className="admin-icon-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Import
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden-input" onChange={handleImport} />
          <button className="admin-icon-btn" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="admin-icon-btn danger" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <Package size={16} /> Products
        </button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={16} /> Website Content
        </button>
      </div>

      <div className="admin-main">
        {activeTab === 'products' ? (
          <>
            {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon total"><Package size={22} /></div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bedsheets"><ShoppingBag size={22} /></div>
            <div className="stat-info">
              <h3>{stats.bedsheets}</h3>
              <p>Bedsheets</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon curtains"><Layers size={22} /></div>
            <div className="stat-info">
              <h3>{stats.curtains}</h3>
              <p>Curtains</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon preloved"><Heart size={22} /></div>
            <div className="stat-info">
              <h3>{stats.preloved}</h3>
              <p>Pre-loved</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-product-btn" onClick={openAddModal}>
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Product Table */}
        {filtered.length > 0 ? (
          <div className="product-table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product-info">
                        <img src={product.image} alt={product.name} className="table-product-thumb" />
                        <div>
                          <div className="table-product-name">{product.name}</div>
                          <div className="table-product-desc">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`table-badge ${product.category.toLowerCase()}`}>
                        {product.category}
                      </span>
                    </td>
                    <td>
                      <span className={`table-badge ${product.condition === 'New' ? 'new' : 'preloved'}`}>
                        {product.condition}
                      </span>
                    </td>
                    <td className="table-price">${product.price}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-action-btn" onClick={() => openEditModal(product)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button className="table-action-btn delete" onClick={() => setDeleteConfirm(product)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <Package size={48} />
            <h3>No products found</h3>
            <p>{searchTerm ? 'Try a different search term.' : 'Click "Add Product" to get started.'}</p>
          </div>
        )}
          </>
        ) : (
          <div className="settings-panel">
            <h2>Edit Website Content</h2>
            <form onSubmit={handleSettingsSave} className="settings-form">
              <div className="form-group">
                <label>Website Name</label>
                <input type="text" value={settingsForm.siteName} onChange={e => setSettingsForm({...settingsForm, siteName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Hero Headline</label>
                <input type="text" value={settingsForm.heroHeadline} onChange={e => setSettingsForm({...settingsForm, heroHeadline: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Hero Subtitle</label>
                <textarea value={settingsForm.heroSubtitle} onChange={e => setSettingsForm({...settingsForm, heroSubtitle: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>About Us / Footer Text</label>
                <textarea value={settingsForm.aboutText} onChange={e => setSettingsForm({...settingsForm, aboutText: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Logo Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'logoImage')} />
                {settingsForm.logoImage && <img src={settingsForm.logoImage} alt="Logo Preview" style={{ height: '40px', objectFit: 'contain', marginTop: '0.5rem' }} />}
              </div>
              <div className="form-group">
                <label>Hero Background Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'heroBackgroundImage')} />
                {settingsForm.heroBackgroundImage && <img src={settingsForm.heroBackgroundImage} alt="Hero Preview" className="image-preview" />}
              </div>
              <div className="form-group">
                <label>Category 1 Image (Bedsheets)</label>
                <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'categoryImage1')} />
                {settingsForm.categoryImage1 && <img src={settingsForm.categoryImage1} alt="Category 1 Preview" className="image-preview" />}
              </div>
              <div className="form-group">
                <label>Category 2 Image (Curtains)</label>
                <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'categoryImage2')} />
                {settingsForm.categoryImage2 && <img src={settingsForm.categoryImage2} alt="Category 2 Preview" className="image-preview" />}
              </div>
              <button type="submit" className="btn btn-primary">Save Content</button>
            </form>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Egyptian Cotton Sheet Set"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="Bedsheets">Bedsheets</option>
                      <option value="Curtains">Curtains</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Condition</label>
                    <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
                      <option value="New">New</option>
                      <option value="Pre-loved">Pre-loved</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {formData.image && (
                    <div className="form-group full-width">
                      <label>Preview</label>
                      <img src={formData.image} alt="Preview" className="image-preview" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A brief description of the product..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="modal-save-btn">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="confirm-content">
              <div className="confirm-icon"><Trash2 size={24} /></div>
              <h3>Delete Product</h3>
              <p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="modal-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="confirm-delete-btn" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Admin;
