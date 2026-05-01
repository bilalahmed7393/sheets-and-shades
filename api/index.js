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
  image: { type: String },
  description: { type: String }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  id: { type: String, default: 'global' },
  siteName: { type: String, default: 'ZAUQ Bedding & More' },
  heroHeadline: { type: String, default: 'Curated Comfort for Your Home' },
  heroSubtitle: { type: String, default: 'Discover our premium collection of pre-loved and new bedsheets and curtains.' },
  aboutText: { type: String, default: 'A marketplace for premium bedsheets and curtains.' },
  logoImage: { type: String, default: '' },
  heroBackgroundImage: { type: String, default: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  categoryImage1: { type: String, default: 'https://images.unsplash.com/photo-1522771731478-40b95bc8e4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  categoryImage2: { type: String, default: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  primaryColor: { type: String, default: '#8b7355' },
  secondaryColor: { type: String, default: '#8f9779' },
  backgroundColor: { type: String, default: '#faf9f6' },
  textColor: { type: String, default: '#2c302e' },
  faqContent: { type: String, default: '<h3>How do I place an order?</h3>\n<p>Simply browse our collection, add items to your cart, and proceed to checkout. Fill in your shipping details and your order will be confirmed instantly.</p>\n\n<h3>What payment methods do you accept?</h3>\n<p>We accept cash on delivery (COD) for all orders within Pakistan.</p>\n\n<h3>Can I return or exchange a product?</h3>\n<p>Yes! We offer hassle-free returns and exchanges within 7 days of delivery. Please ensure the product is in its original condition.</p>\n\n<h3>How long does delivery take?</h3>\n<p>Standard delivery takes 3-5 business days across Pakistan. Express delivery options are available at checkout.</p>' },
  shippingContent: { type: String, default: '<h3>Shipping Policy</h3>\n<p>We ship to all major cities across Pakistan. Standard shipping takes 3-5 business days.</p>\n\n<h3>Shipping Rates</h3>\n<p>Free shipping on orders above PKR 3,000. A flat rate of PKR 200 applies to orders below this amount.</p>\n\n<h3>Returns & Exchanges</h3>\n<p>We want you to love your purchase. If you are not satisfied, you may return or exchange the item within 7 days of delivery. The product must be unused and in its original packaging.</p>\n\n<h3>Refund Process</h3>\n<p>Once we receive your returned item, we will inspect it and process your refund within 3-5 business days.</p>' },
  contactContent: { type: String, default: '<h3>Get in Touch</h3>\n<p>We would love to hear from you! Whether you have a question about our products, need help with an order, or just want to say hello, feel free to reach out.</p>\n\n<h3>Email</h3>\n<p>support@zauqbedding.com</p>\n\n<h3>Phone</h3>\n<p>+92 300 1234567</p>\n\n<h3>Business Hours</h3>\n<p>Monday - Saturday: 10:00 AM - 8:00 PM (PKT)<br>Sunday: Closed</p>' }
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

