import { useState, useEffect, useRef } from 'react';
import {
  Lock, LogOut, Plus, Pencil, Trash2, Search,
  X, Package, ShoppingBag, Layers, Heart,
  CheckCircle, AlertCircle, Settings as SettingsIcon,
  ClipboardList, ChevronDown, Eye
} from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct, getNextId, updateSettings, getOrders, updateOrderStatus, deleteOrder as deleteOrderApi } from '../data';
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
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      getOrders().then(setOrders).catch(() => {});
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

  // Order management
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? updated : o));
      showToast(`Order updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrderApi(orderId);
      setOrders(orders.filter(o => o._id !== orderId));
      setSelectedOrder(null);
      showToast('Order deleted');
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
          <div className="brand-text">{settings.siteName}</div>
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
          <div className="admin-brand">{settings.siteName}</div>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-header-right">
          <button className="admin-icon-btn danger" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <Package size={16} /> Products
        </button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ClipboardList size={16} /> Orders {orders.length > 0 && <span className="admin-badge" style={{ marginLeft: '0.25rem', fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{orders.length}</span>}
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
        ) : activeTab === 'orders' ? (
          <>
            {/* Orders Tab */}
            {selectedOrder ? (
              <div className="settings-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2>Order #{selectedOrder.orderNumber}</h2>
                  <button className="admin-icon-btn" onClick={() => setSelectedOrder(null)}>← Back</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Customer Name</label>
                    <p style={{ color: '#e4e6ea' }}>{selectedOrder.customerName}</p>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <p style={{ color: '#e4e6ea' }}>{selectedOrder.customerEmail}</p>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <p style={{ color: '#e4e6ea' }}>{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                      style={{ padding: '0.5rem', background: '#1a1d23', border: '1px solid #33363e', borderRadius: '0.5rem', color: '#e4e6ea', fontFamily: 'inherit' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Shipping Address</label>
                    <p style={{ color: '#e4e6ea' }}>{selectedOrder.shippingAddress}, {selectedOrder.shippingCity} {selectedOrder.shippingZip}</p>
                  </div>
                </div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8e96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</label>
                <div className="product-table-container" style={{ marginTop: '0.5rem' }}>
                  <table className="product-table">
                    <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td>
                            <div className="table-product-info">
                              <img src={item.image} alt={item.name} className="table-product-thumb" />
                              <div className="table-product-name">{item.name}</div>
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td className="table-price">${item.price.toFixed(2)}</td>
                          <td className="table-price">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2d3039' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9a96e' }}>Total: ${selectedOrder.total.toFixed(2)}</span>
                  <button className="admin-icon-btn danger" onClick={() => handleDeleteOrder(selectedOrder._id)}>
                    <Trash2 size={16} /> Delete Order
                  </button>
                </div>
              </div>
            ) : orders.length > 0 ? (
              <div className="product-table-container">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 600, color: '#c9a96e', fontSize: '0.85rem' }}>{order.orderNumber}</td>
                        <td>
                          <div className="table-product-name">{order.customerName}</div>
                          <div className="table-product-desc">{order.customerEmail}</div>
                        </td>
                        <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                        <td className="table-price">${order.total.toFixed(2)}</td>
                        <td>
                          <span className={`table-badge ${order.status === 'Pending' ? 'preloved' : order.status === 'Delivered' ? 'new' : order.status === 'Cancelled' ? '' : 'bedsheets'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#8b8e96' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-btn" onClick={() => setSelectedOrder(order)} title="View">
                              <Eye size={15} />
                            </button>
                            <button className="table-action-btn delete" onClick={() => handleDeleteOrder(order._id)} title="Delete">
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
                <ClipboardList size={48} />
                <h3>No orders yet</h3>
                <p>Orders will appear here when customers place them through your store.</p>
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

              <h2 style={{ marginTop: '2rem' }}>Theme & Colors</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Primary Color (Buttons & Accents)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="color" value={settingsForm.primaryColor || '#8b7355'} onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})} style={{ width: '48px', height: '48px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    <input type="text" value={settingsForm.primaryColor || '#8b7355'} onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Secondary Color (Badges & Tags)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="color" value={settingsForm.secondaryColor || '#8f9779'} onChange={e => setSettingsForm({...settingsForm, secondaryColor: e.target.value})} style={{ width: '48px', height: '48px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    <input type="text" value={settingsForm.secondaryColor || '#8f9779'} onChange={e => setSettingsForm({...settingsForm, secondaryColor: e.target.value})} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Background Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="color" value={settingsForm.backgroundColor || '#faf9f6'} onChange={e => setSettingsForm({...settingsForm, backgroundColor: e.target.value})} style={{ width: '48px', height: '48px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    <input type="text" value={settingsForm.backgroundColor || '#faf9f6'} onChange={e => setSettingsForm({...settingsForm, backgroundColor: e.target.value})} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Text Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="color" value={settingsForm.textColor || '#2c302e'} onChange={e => setSettingsForm({...settingsForm, textColor: e.target.value})} style={{ width: '48px', height: '48px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    <input type="text" value={settingsForm.textColor || '#2c302e'} onChange={e => setSettingsForm({...settingsForm, textColor: e.target.value})} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>

              <h2 style={{ marginTop: '2rem' }}>Support Pages</h2>
              <p style={{ color: '#8b8e96', fontSize: '0.85rem', marginBottom: '1rem' }}>Edit the content for your FAQ, Shipping, and Contact pages. You can use basic HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;br&gt; for formatting.</p>
              <div className="form-group">
                <label>FAQ Page Content</label>
                <textarea value={settingsForm.faqContent || ''} onChange={e => setSettingsForm({...settingsForm, faqContent: e.target.value})} rows={10} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>
              <div className="form-group">
                <label>Shipping & Returns Page Content</label>
                <textarea value={settingsForm.shippingContent || ''} onChange={e => setSettingsForm({...settingsForm, shippingContent: e.target.value})} rows={10} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>
              <div className="form-group">
                <label>Contact Us Page Content</label>
                <textarea value={settingsForm.contactContent || ''} onChange={e => setSettingsForm({...settingsForm, contactContent: e.target.value})} rows={10} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
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
