import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sheets_and_shades';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: 0 },
  image: { type: String },
  images: [{ type: String }],
  description: { type: String },
  sku: { type: String, default: '' },
  stockQuantity: { type: Number, default: 50 },
  material: { type: String, default: '' },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  badge: { type: String, default: 'None', enum: ['None', 'New Arrival', 'Best Seller', 'Sale', 'Limited Edition'] },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  id: { type: String, default: 'global' },
  // Branding
  siteName: { type: String, default: 'ZAUQ Bedding & More' },
  siteTagline: { type: String, default: 'Premium Bedding & Home Decor' },
  logoImage: { type: String, default: '' },
  // Hero
  heroHeadline: { type: String, default: 'Curated Comfort for Your Home' },
  heroSubtitle: { type: String, default: 'Discover our premium collection of pre-loved and new bedsheets and curtains.' },
  heroBackgroundImage: { type: String, default: '' },
  heroCta1Text: { type: String, default: 'Shop Collection' },
  heroCta1Link: { type: String, default: '/shop' },
  // Announcement Bar
  showAnnouncement: { type: Boolean, default: false },
  announcementText: { type: String, default: '🎉 Free shipping on orders above PKR 3,000!' },
  // Category images
  categoryImage1: { type: String, default: '' },
  categoryImage2: { type: String, default: '' },
  // About
  aboutText: { type: String, default: 'A marketplace for premium bedsheets and curtains.' },
  // Theme
  primaryColor: { type: String, default: '#2d6a4f' },
  secondaryColor: { type: String, default: '#b5941f' },
  backgroundColor: { type: String, default: '#faf9f6' },
  textColor: { type: String, default: '#1a2e1f' },
  // Support Pages (Structured)
  faq: [{
    question: { type: String, default: '' },
    answer: { type: String, default: '' }
  }],
  shippingPolicy: { type: String, default: '' },
  returnPolicy: { type: String, default: '' },
  deliveryEstimate: { type: String, default: '3-5 business days' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
  contactWorkingHours: { type: String, default: '' },
  // WhatsApp
  showWhatsApp: { type: Boolean, default: false },
  whatsappNumber: { type: String, default: '' },
  // Social
  facebookUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  tiktokUrl: { type: String, default: '' },
  // Shipping Settings
  shippingFlatRate: { type: Number, default: 200 },
  shippingFreeThreshold: { type: Number, default: 3000 },
  // Admin
  adminUsername: { type: String, default: 'zauq_admin' },
  adminPassword: { type: String, default: 'zauq2024!' }
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  shippingCity: { type: String, required: true },
  shippingZip: { type: String, required: true },
  items: [{
    productId: Number,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new product
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update an existing product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: Number(req.params.id) });
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST batch import
app.post('/api/products/batch', async (req, res) => {
  try {
    const products = req.body;
    await Product.deleteMany({}); // Optional: clear existing
    const saved = await Product.insertMany(products);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET Settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = await Settings.create({ id: 'global' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT Settings
app.put('/api/settings', async (req, res) => {
  try {
    const updated = await Settings.findOneAndUpdate(
      { id: 'global' },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const lowStockProducts = await Product.find({ stockQuantity: { $lt: 5 } }).select('id name stockQuantity image');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = await Order.find({ createdAt: { $gte: monthStart } });
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
    
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      ordersToday,
      monthlyRevenue,
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Orders ----

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const order = new Order({ ...req.body, orderNumber });
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server (if not running in a serverless environment like Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

