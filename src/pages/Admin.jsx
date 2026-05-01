import { useState, useEffect, useRef } from 'react';
import {
  Lock, LogOut, Plus, Pencil, Trash2, Search,
  X, Package, ShoppingBag, Layers, Heart,
  CheckCircle, AlertCircle, Settings as SettingsIcon,
  ClipboardList, ChevronDown, Eye, LayoutDashboard,
  FileText, ExternalLink, TrendingUp, AlertTriangle
} from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct, getNextId, updateSettings, getOrders, updateOrderStatus, deleteOrder as deleteOrderApi, getDashboardStats } from '../data';
import { useSiteSettings } from '../SiteContext';
import './Admin.css';

const ADMIN_USERNAME = 'zauq_admin';
const ADMIN_PASSWORD = 'zauq2024!';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dashStats, setDashStats] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const { settings, updateLocalSettings } = useSiteSettings();
  const [settingsForm, setSettingsForm] = useState(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Bedsheets',
    condition: 'New',
    price: '',
    salePrice: '',
    image: '',
    images: [],
    description: '',
    sku: '',
    stockQuantity: '50',
    material: '',
    sizes: [],
    colors: [],
    badge: 'None',
    isFeatured: false,
    isActive: true
  });

  useEffect(() => {
    if (isLoggedIn) {
      getProducts().then(setProducts);
      getOrders().then(setOrders).catch(() => {});
      getDashboardStats().then(setDashStats).catch(() => {});
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
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
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
    setFormData({
      name: '',
      category: 'Bedsheets',
      condition: 'New',
      price: '',
      salePrice: '',
      image: '',
      images: [],
      description: '',
      sku: '',
      stockQuantity: '50',
      material: '',
      sizes: [],
      colors: [],
      badge: 'None',
      isFeatured: false,
      isActive: true
    });
    setShowModal(true);
  };

  const handleImageUpload = (e, isGallery = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
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
          if (isGallery) {
            setFormData(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
          } else {
            setFormData(prev => ({ ...prev, image: dataUrl }));
          }
        };
      };
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      condition: product.condition,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      image: product.image,
      images: product.images || [],
      description: product.description || '',
      sku: product.sku || '',
      stockQuantity: product.stockQuantity?.toString() || '0',
      material: product.material || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      badge: product.badge || 'None',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const toggleSize = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const addColor = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const color = e.target.value.trim();
      if (!formData.colors.includes(color)) {
        setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
      }
      e.target.value = '';
    }
  };

  const removeColor = (color) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // CRUD
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0
      };

      if (editingProduct) {
        const productToUpdate = { ...editingProduct, ...formattedData };
        const updatedProduct = await updateProduct(productToUpdate);
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        showToast(`"${formData.name}" updated successfully`);
      } else {
        const newProduct = {
          id: getNextId(products),
          ...formattedData
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
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h1>🛏️ {settings.siteName}</h1>
          <p>Sign in to manage your store</p>
          <form onSubmit={handleLogin}>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="form-group-v2">
              <label>Username</label>
              <input type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </div>
            <div className="form-group-v2">
              <label>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-admin primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const tabLabel = { dashboard: 'Dashboard', products: 'Products', orders: 'Orders', settings: 'Website Content', storeSettings: 'Settings' };
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  // =============== MAIN LAYOUT ===============
  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>{settings.siteName}</h2>
          <p>Admin Portal</p>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </button>
          <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={18} /> <span>Products</span>
          </button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ClipboardList size={18} /> <span>Orders</span>
            {pendingCount > 0 && <span className="link-badge">{pendingCount}</span>}
          </button>
          <div className="sidebar-section-label">Content</div>
          <button className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <FileText size={18} /> <span>Website Content</span>
          </button>
          <div className="sidebar-section-label">System</div>
          <button className={`sidebar-link ${activeTab === 'storeSettings' ? 'active' : ''}`} onClick={() => setActiveTab('storeSettings')}>
            <SettingsIcon size={18} /> <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-admin secondary" style={{ width: '100%' }} onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </aside>

      {/* Content */}
      <div className="admin-content">
        <div className="admin-topbar">
          <h1>{tabLabel[activeTab] || 'Admin'}</h1>
          <div className="topbar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-admin secondary"><ExternalLink size={14} /> View Site</a>
          </div>
        </div>
        <div className="admin-body">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card-v2"><div className="stat-icon-v2 green"><ShoppingBag size={22} /></div><div className="stat-info"><h3>{dashStats?.ordersToday ?? 0}</h3><p>Orders Today</p></div></div>
              <div className="stat-card-v2"><div className="stat-icon-v2 gold"><TrendingUp size={22} /></div><div className="stat-info"><h3>PKR {(dashStats?.monthlyRevenue ?? 0).toLocaleString()}</h3><p>Revenue This Month</p></div></div>
              <div className="stat-card-v2"><div className="stat-icon-v2 blue"><Package size={22} /></div><div className="stat-info"><h3>{dashStats?.totalProducts ?? 0}</h3><p>Total Products</p></div></div>
              <div className="stat-card-v2"><div className="stat-icon-v2 red"><AlertCircle size={22} /></div><div className="stat-info"><h3>{dashStats?.pendingOrders ?? 0}</h3><p>Pending Orders</p></div></div>
            </div>

            <div className="admin-panel">
              <h2>Recent Orders</h2>
              {dashStats?.recentOrders?.length > 0 ? (
                <table className="data-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                  {dashStats.recentOrders.map(o => (
                    <tr key={o._id}><td style={{fontFamily:'monospace',fontSize:'0.8rem'}}>{o.orderNumber}</td><td>{o.customerName}</td><td>PKR {o.total?.toLocaleString()}</td><td><span className={`status-badge ${o.status?.toLowerCase()}`}>{o.status}</span></td></tr>
                  ))}
                </tbody></table>
              ) : <p style={{color:'#8b8e96',fontSize:'0.9rem'}}>No orders yet.</p>}
            </div>

            {dashStats?.lowStockProducts?.length > 0 && (
              <div className="admin-panel">
                <h2><AlertTriangle size={16} style={{color:'#ef4444',marginRight:'0.5rem'}} />Low Stock Alerts</h2>
                <table className="data-table"><thead><tr><th>Product</th><th>Stock</th></tr></thead><tbody>
                  {dashStats.lowStockProducts.map(p => (
                    <tr key={p.id}><td>{p.name}</td><td><span className="status-badge cancelled">{p.stockQuantity} left</span></td></tr>
                  ))}
                </tbody></table>
              </div>
            )}
          </>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
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
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
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
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <span className="table-badge new">{product.category}</span>
                            {product.badge !== 'None' && <span className="table-badge gold">{product.badge}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{product.sku || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${product.stockQuantity > 10 ? 'delivered' : 'cancelled'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td>
                      {product.salePrice > 0 ? (
                        <div>
                          <div style={{ color: '#b5941f', fontWeight: '700' }}>PKR {product.salePrice}</div>
                          <div style={{ color: '#8b8e96', fontSize: '0.75rem', textDecoration: 'line-through' }}>PKR {product.price}</div>
                        </div>
                      ) : (
                        <div style={{ fontWeight: '600' }}>PKR {product.price}</div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${product.isActive ? 'delivered' : 'cancelled'}`}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
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
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
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
                          <td className="table-price">PKR {item.price.toLocaleString()}</td>
                          <td className="table-price">PKR {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #21262d' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#b5941f' }}>Total: PKR {selectedOrder.total.toLocaleString()}</span>
                  <button className="btn-admin secondary" onClick={() => setSelectedOrder(null)}>
                    Close Details
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
                        <td style={{ fontWeight: 600, color: '#b5941f', fontSize: '0.85rem' }}>{order.orderNumber}</td>
                        <td>
                          <div className="table-product-name">{order.customerName}</div>
                          <div className="table-product-desc">{order.customerCity}</div>
                        </td>
                        <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                        <td className="table-price">PKR {order.total.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
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
        )}

        {/* WEBSITE CONTENT */}
        {activeTab === 'settings' && (
          <div className="settings-panel">
            <h2>Website Content Management</h2>
            <form onSubmit={handleSettingsSave} className="settings-form">
              
              <div className="admin-section-box">
                <h3 className="section-title">Announcement Bar</h3>
                <div className="form-group-v2">
                  <div className="toggle-row">
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.showAnnouncement} 
                        onChange={e => setSettingsForm({...settingsForm, showAnnouncement: e.target.checked})} 
                      />
                      <span className="toggle-slider"></span>
                    </div>
                    <span>Show Announcement Bar?</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Announcement Text</label>
                  <input type="text" value={settingsForm.announcementText || ''} onChange={e => setSettingsForm({...settingsForm, announcementText: e.target.value})} placeholder="e.g. Free shipping on orders over PKR 5000!" />
                </div>
              </div>

              <div className="admin-section-box">
                <h3 className="section-title">Navbar & Branding</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Logo Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'logoImage')} />
                    {settingsForm.logoImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                        <img src={settingsForm.logoImage} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                        <button type="button" className="btn-icon danger" onClick={() => setSettingsForm({...settingsForm, logoImage: ''})}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Site Name</label>
                    <input type="text" value={settingsForm.siteName} onChange={e => setSettingsForm({...settingsForm, siteName: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group-v2" style={{ marginTop: '1rem' }}>
                  <div className="toggle-row">
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.showWhatsApp} 
                        onChange={e => setSettingsForm({...settingsForm, showWhatsApp: e.target.checked})} 
                      />
                      <span className="toggle-slider"></span>
                    </div>
                    <span>Show WhatsApp Floating Button?</span>
                  </div>
                </div>
              </div>

              <div className="admin-section-box">
                <h3 className="section-title">Hero Section</h3>
                <div className="form-group">
                  <label>Hero Background Image</label>
                  <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'heroBackgroundImage')} />
                  {settingsForm.heroBackgroundImage && <img src={settingsForm.heroBackgroundImage} alt="Hero Preview" className="image-preview" style={{ height: '150px', width: '100%', objectFit: 'cover', borderRadius: '0.5rem', marginTop: '0.75rem' }} />}
                </div>
                <div className="form-group">
                  <label>Hero Headline</label>
                  <input type="text" value={settingsForm.heroHeadline} onChange={e => setSettingsForm({...settingsForm, heroHeadline: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Hero Subtitle</label>
                  <textarea value={settingsForm.heroSubtitle} onChange={e => setSettingsForm({...settingsForm, heroSubtitle: e.target.value})} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>CTA Button 1 Text</label>
                    <input type="text" value={settingsForm.heroCta1Text || ''} onChange={e => setSettingsForm({...settingsForm, heroCta1Text: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>CTA Button 1 Link</label>
                    <input type="text" value={settingsForm.heroCta1Link || ''} onChange={e => setSettingsForm({...settingsForm, heroCta1Link: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="admin-section-box">
                <h3 className="section-title">Support Pages Content</h3>
                <p style={{ color: '#8b8e96', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Use basic HTML tags for formatting if needed.</p>
                <div className="form-group">
                  <label>FAQ Content</label>
                  <textarea value={settingsForm.faqContent || ''} onChange={e => setSettingsForm({...settingsForm, faqContent: e.target.value})} rows={6} />
                </div>
                <div className="form-group">
                  <label>Shipping & Returns Content</label>
                  <textarea value={settingsForm.shippingContent || ''} onChange={e => setSettingsForm({...settingsForm, shippingContent: e.target.value})} rows={6} />
                </div>
                <div className="form-group">
                  <label>Contact Content</label>
                  <textarea value={settingsForm.contactContent || ''} onChange={e => setSettingsForm({...settingsForm, contactContent: e.target.value})} rows={6} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="submit" className="btn-admin primary" style={{ padding: '0.8rem 2.5rem' }}>Save All Changes</button>
              </div>
            </form>
          </div>
        )}

        {/* STORE SETTINGS */}
        {activeTab === 'storeSettings' && (
          <div className="settings-panel">
            <h2>Store Settings</h2>
            <form onSubmit={handleSettingsSave} className="settings-form">
              
              <div className="admin-section-box">
                <h3 className="section-title">Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input type="email" value={settingsForm.contactEmail || ''} onChange={e => setSettingsForm({...settingsForm, contactEmail: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input type="text" value={settingsForm.contactPhone || ''} onChange={e => setSettingsForm({...settingsForm, contactPhone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Number (with country code)</label>
                    <input type="text" value={settingsForm.whatsappNumber || ''} onChange={e => setSettingsForm({...settingsForm, whatsappNumber: e.target.value})} placeholder="e.g. 923001234567" />
                  </div>
                  <div className="form-group">
                    <label>Store Address</label>
                    <input type="text" value={settingsForm.storeAddress || ''} onChange={e => setSettingsForm({...settingsForm, storeAddress: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="admin-section-box">
                <h3 className="section-title">Social Media Links</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Facebook URL</label>
                    <input type="text" value={settingsForm.facebookUrl || ''} onChange={e => setSettingsForm({...settingsForm, facebookUrl: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input type="text" value={settingsForm.instagramUrl || ''} onChange={e => setSettingsForm({...settingsForm, instagramUrl: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Tiktok URL</label>
                    <input type="text" value={settingsForm.tiktokUrl || ''} onChange={e => setSettingsForm({...settingsForm, tiktokUrl: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="admin-section-box">
                <h3 className="section-title">Theme & Design Tokens</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Primary Brand Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="color" value={settingsForm.primaryColor || '#2d6a4f'} onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})} style={{ width: '40px', height: '40px', padding: 0, border: 'none' }} />
                      <input type="text" value={settingsForm.primaryColor || '#2d6a4f'} onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})} style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Gold Accent Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="color" value={settingsForm.secondaryColor || '#b5941f'} onChange={e => setSettingsForm({...settingsForm, secondaryColor: e.target.value})} style={{ width: '40px', height: '40px', padding: 0, border: 'none' }} />
                      <input type="text" value={settingsForm.secondaryColor || '#b5941f'} onChange={e => setSettingsForm({...settingsForm, secondaryColor: e.target.value})} style={{ flex: 1 }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-section-box">
                <h3 className="section-title">Shipping & Logic</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Free Shipping Threshold (PKR)</label>
                    <input type="number" value={settingsForm.freeShippingThreshold || '5000'} onChange={e => setSettingsForm({...settingsForm, freeShippingThreshold: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Standard Shipping Fee (PKR)</label>
                    <input type="number" value={settingsForm.shippingFee || '250'} onChange={e => setSettingsForm({...settingsForm, shippingFee: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="submit" className="btn-admin primary" style={{ padding: '0.8rem 2.5rem' }}>Save System Settings</button>
              </div>
            </form>
          </div>
        )}

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
                    <label>SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Auto-generated if blank"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="Bedsheets">Bedsheets</option>
                      <option value="Curtains">Curtains</option>
                      <option value="Pillow Covers">Pillow Covers</option>
                      <option value="Comforters">Comforters</option>
                      <option value="Bundles">Bundles</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Price (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Sale Price (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Badge</label>
                    <select value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })}>
                      <option value="None">None</option>
                      <option value="New Arrival">New Arrival</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Sale">Sale</option>
                      <option value="Limited Edition">Limited Edition</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g. Cotton, Silk, Linen"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Available Sizes</label>
                    <div className="size-checkboxes" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {['Single', 'Double', 'King', 'Queen', 'Custom'].map(size => (
                        <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.sizes.includes(size)}
                            onChange={() => toggleSize(size)}
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Available Colors (Press Enter to add)</label>
                    <input
                      type="text"
                      placeholder="Type a color and press Enter"
                      onKeyDown={addColor}
                    />
                    <div className="color-tags" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {formData.colors.map(color => (
                        <span key={color} className="admin-badge gold" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem' }}>
                          {color}
                          <X size={12} onClick={() => removeColor(color)} style={{ cursor: 'pointer' }} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '0.75rem', position: 'relative', width: 'fit-content' }}>
                        <img src={formData.image} alt="Main" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #21262d' }} />
                        <button type="button" onClick={() => setFormData({...formData, image: ''})} className="btn-icon danger" style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', width: '20px', height: '20px' }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Gallery Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {formData.images.map((img, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img src={img} alt={`Gallery ${index}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #21262d' }} />
                          <button type="button" onClick={() => removeGalleryImage(index)} className="btn-icon danger" style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', width: '18px', height: '18px' }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <label className="toggle-row" style={{ cursor: 'pointer' }}>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={formData.isFeatured} 
                            onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                          />
                          <span className="toggle-slider"></span>
                        </div>
                        <span>Is Featured?</span>
                      </label>
                      <label className="toggle-row" style={{ cursor: 'pointer' }}>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={formData.isActive} 
                            onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                          />
                          <span className="toggle-slider"></span>
                        </div>
                        <span>Is Active/Published?</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Full product description and care instructions..."
                      rows={5}
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
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

        </div>{/* end admin-body */}
      </div>{/* end admin-content */}
    </div>
  );
}

export default Admin;
