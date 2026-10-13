import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'landsellingapp-secret-jwt-key-2024';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized');
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT is missing in .env. Authentication will fail.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/landsellingapp';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Models ---
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String },
  name: { type: String },
  role: { type: String, enum: ['Buyer', 'Seller', 'Agent', 'Admin'], default: 'Buyer' },
  pin: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  propertyType: { type: String },
  price: { type: Number, required: true },
  area: { type: Number },
  areaUnit: { type: String },
  location: { type: String },
  district: { type: String },
  taluk: { type: String },
  village: { type: String },
  images: [{ type: String }],
  facing: { type: String },
  roadWidth: { type: Number },
  electricity: { type: Boolean },
  water: { type: Boolean },
  approval: { type: String },
  seller: {
    id: { type: String },
    name: { type: String },
    phone: { type: String },
    type: { type: String }
  },
  status: { type: String, default: 'Available' },
  verificationStatus: { type: String, default: 'Unverified' },
  documents: { type: mongoose.Schema.Types.Mixed },
  pincode: { type: String },
  surveyNumber: { type: String },
  subdivisionNumber: { type: String },
  views: { type: Number, default: 0 },
  enquiries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
const Property = mongoose.model('Property', propertySchema);

const complaintSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
});
const Complaint = mongoose.model('Complaint', complaintSchema);

// --- Middleware ---
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. If Firebase Admin initialized, try verifying Firebase token
  if (admin.apps.length > 0) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (_) {
      // Fall through to try JWT
    }
  }

  // 2. Try JWT token verification (issued for PIN logins)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_) {
    // If token starts with mock-token for local testing
    if (token.startsWith('mock-token')) {
      req.user = { uid: token, isMock: true };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const uid = req.user.uid || req.user.firebaseUid;
    const dbUser = await User.findOne({ firebaseUid: uid });
    if (dbUser && dbUser.role === 'Admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// --- Routes ---

// Live PIN Login: Verify 4-digit PIN against MongoDB
app.post('/api/auth/login-pin', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone number and PIN are required' });
    }

    const digits = phone.replace(/\D/g, '').slice(-10);
    const withCountryCode = `+91${digits}`;

    const user = await User.findOne({
      $or: [
        { phone: withCountryCode },
        { phone: digits },
        { phone: phone }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found for this mobile number. Please register or login with OTP first.' });
    }

    if (!user.pin) {
      return res.status(400).json({ error: 'No PIN has been configured for this account yet. Please log in using OTP first to set a PIN.' });
    }

    if (user.pin !== String(pin).trim()) {
      return res.status(401).json({ error: 'Incorrect PIN. Please try again or log in with OTP.' });
    }

    // Generate JWT token for session
    const token = jwt.sign(
      { uid: user.firebaseUid, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.firebaseUid,
        name: user.name || `User ${digits.slice(-4)}`,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set / Update 4-Digit PIN in MongoDB
app.post('/api/auth/set-pin', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone number and PIN are required' });
    }
    const cleanPin = String(pin).trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    const digits = phone.replace(/\D/g, '').slice(-10);
    const withCountryCode = `+91${digits}`;

    let user = await User.findOne({
      $or: [
        { phone: withCountryCode },
        { phone: digits },
        { phone: phone }
      ]
    });

    if (user) {
      user.pin = cleanPin;
      await user.save();
    } else {
      user = new User({
        firebaseUid: `uid_${Date.now()}`,
        phone: withCountryCode,
        pin: cleanPin,
        role: 'Buyer',
        name: `User ${digits.slice(-4)}`
      });
      await user.save();
    }

    res.json({ message: 'PIN saved successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync User from Firebase Phone Auth to MongoDB
app.post('/api/users/sync', verifyToken, async (req, res) => {
  try {
    const { phone, name, email, role, pin } = req.body;
    const uid = req.user.uid || req.user.firebaseUid;
    let user = await User.findOne({ firebaseUid: uid });
    
    const formattedPhone = phone || req.user.phone_number || req.user.phone || '';
    
    if (!user) {
      user = new User({
        firebaseUid: uid,
        phone: formattedPhone,
        email: email || '',
        name: name || 'User',
        role: role || 'Buyer',
        pin: pin || undefined
      });
      await user.save();
    } else {
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (pin) user.pin = pin;
      if (formattedPhone && !user.phone) user.phone = formattedPhone;
      await user.save();
    }
    
    res.json({ message: 'User synced successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User Session
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid || req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get all users
app.get('/api/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Delete a user
app.delete('/api/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    try {
      await admin.auth().deleteUser(user.firebaseUid);
    } catch (fbError) {
      console.error('Error deleting from Firebase:', fbError);
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Properties CRUD Routes ---

// Get all properties (supports optional filtering)
app.get('/api/properties', async (req, res) => {
  try {
    const { district, propertyType, status } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (propertyType) filter.propertyType = propertyType;
    if (status) filter.status = status;
    
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new property
app.post('/api/properties', async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Property not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Property not found' });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get properties for a user
app.get('/api/properties/user/:userId', async (req, res) => {
  try {
    const properties = await Property.find({ 'seller.id': req.params.userId }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get Dashboard Stats
app.get('/api/admin/dashboard-stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: 'Buyer' });
    const sellers = await User.countDocuments({ role: 'Seller' });
    const agents = await User.countDocuments({ role: 'Agent' });

    const totalProperties = await Property.countDocuments();
    const publishedProps = await Property.countDocuments({ status: 'Published' });
    const pendingProps = await Property.countDocuments({ status: 'Pending' });

    const openComplaints = await Complaint.countDocuments({ status: 'Open' });

    res.json({
      users: {
        total: totalUsers,
        active: totalUsers,
        buyers: buyers,
        sellers: sellers,
        agents: agents
      },
      properties: {
        total: totalProperties,
        published: publishedProps,
        pending: pendingProps
      },
      financial: {
        revenue: 0,
        activeSubscriptions: 0
      },
      issues: {
        pendingDocuments: 0,
        openComplaints: openComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
