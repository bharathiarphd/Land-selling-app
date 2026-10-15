import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'landsellingapp-secret-jwt-key-2024';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (Optional - does not crash if invalid/missing)
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_SERVICE_ACCOUNT.includes('PASTE_YOUR_PROJECT_ID')) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized');
  } else {
    console.log('Firebase Admin credentials not configured - using local auth mode.');
  }
} catch (error) {
  console.log('Firebase Admin not initialized (optional):', error.message);
}

// Disable Mongoose buffering so queries NEVER hang or timeout when MongoDB is offline
mongoose.set('bufferCommands', false);

// Connect to MongoDB with 2s timeout
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/landsellingapp';
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('Connected to MongoDB database'))
  .catch(() => console.log('Local MongoDB not running - Persistent local JSON database activated.'));

const isMongoConnected = () => mongoose.connection.readyState === 1;

// --- Local Persistent Database (Fallback when MongoDB is offline) ---
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'local_db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (_) {}
  return { users: [], properties: [], complaints: [] };
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

const localDb = loadLocalDb();

const isAdminPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  return digits === '8248843385';
};

// Seed default Admin 8248843385 if missing
if (!localDb.users) localDb.users = [];
let adminEntry = localDb.users.find(u => isAdminPhone(u.phone));
if (!adminEntry) {
  localDb.users.unshift({
    _id: 'usr_admin_8248843385',
    firebaseUid: 'admin_8248843385',
    phone: '+918248843385',
    name: 'raja',
    email: 'admin@landsellingapp.com',
    role: 'Admin',
    pin: '5983',
    createdAt: new Date()
  });
  saveLocalDb(localDb);
} else {
  adminEntry.role = 'Admin';
  if (!adminEntry.pin) adminEntry.pin = '5983';
}

// Seed initial demo properties if empty
if (!localDb.properties || localDb.properties.length === 0) {
  localDb.properties = [
    {
      id: 'prop-1',
      title: '2.5 Acres Agricultural Land in Pollachi',
      description: 'Fertile red soil land with drip irrigation, coconut trees, and road access.',
      propertyType: 'Agricultural Land',
      price: 4500000,
      area: 2.5,
      areaUnit: 'Acre',
      location: 'Near Anaimalai Road',
      district: 'Coimbatore',
      taluk: 'Pollachi',
      village: 'Subbegoundenpudur',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60'],
      facing: 'East',
      roadWidth: 20,
      electricity: true,
      water: true,
      approval: 'Panchayat',
      seller: { id: 'seller-1', name: 'Ramasamy K.', phone: '+919876543210', type: 'Owner' },
      status: 'Available',
      verificationStatus: 'Verified by Platform',
      createdAt: new Date()
    },
    {
      id: 'prop-2',
      title: '1500 Sq.Ft DTCP Approved Villa Plot',
      description: 'Ready to build plot in gated community with 30ft tar road and street lights.',
      propertyType: 'Residential Plot',
      price: 1800000,
      area: 1500,
      areaUnit: 'Sq.Ft',
      location: 'Saravanampatti',
      district: 'Coimbatore',
      taluk: 'Coimbatore North',
      village: 'Saravanampatti',
      images: ['https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=800&auto=format&fit=crop&q=60'],
      facing: 'North',
      roadWidth: 30,
      electricity: true,
      water: true,
      approval: 'DTCP',
      seller: { id: 'seller-2', name: 'Sri City Promoters', phone: '+919876543211', type: 'Developer' },
      status: 'Available',
      verificationStatus: 'Verified by Platform',
      createdAt: new Date()
    }
  ];
  saveLocalDb(localDb);
}

// --- Mongoose Models ---
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
    } catch (_) {}
  }

  // 2. Try JWT token verification (issued for PIN logins)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_) {
    // If token starts with mock-token for local testing
    if (token.startsWith('mock-token')) {
      const isMockAdmin = token.includes('admin') || req.headers['x-admin-phone'] === '8248843385';
      req.user = { 
        uid: token, 
        isMock: true, 
        role: isMockAdmin ? 'Admin' : 'Buyer',
        phone: isMockAdmin ? '+918248843385' : undefined 
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const adminHeader = req.headers['x-admin-phone'];
    if (adminHeader && isAdminPhone(adminHeader)) {
      return next();
    }

    const uid = req.user?.uid || req.user?.firebaseUid;
    const userPhone = req.user?.phone;
    if (isAdminPhone(userPhone) || req.user?.role === 'Admin') {
      return next();
    }

    let dbUser = null;
    if (isMongoConnected()) {
      try { 
        dbUser = await User.findOne({ 
          $or: [
            { firebaseUid: uid }, 
            { phone: userPhone },
            { phone: '+918248843385' },
            { phone: '8248843385' }
          ] 
        }); 
      } catch (_) {}
    }
    if (!dbUser) {
      dbUser = localDb.users.find(u => u.firebaseUid === uid || u.phone === userPhone || isAdminPhone(u.phone));
    }
    if (dbUser && (dbUser.role === 'Admin' || isAdminPhone(dbUser.phone))) {
      next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Admin access restricted to ID 8248843385 only' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// --- Routes ---

// Direct Registration with 4-digit PIN (Bypasses SMS message)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, email, role, pin } = req.body;
    if (!name || !phone || !pin) {
      return res.status(400).json({ error: 'Name, mobile number, and 4-digit PIN are required' });
    }

    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }
    const withCountryCode = `+91${digits}`;

    const cleanPin = String(pin).trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Check if user already exists
    let existingUser = null;
    if (isMongoConnected()) {
      try {
        existingUser = await User.findOne({
          $or: [
            { phone: withCountryCode },
            { phone: digits },
            { phone: phone }
          ]
        });
      } catch (_) {}
    }
    if (!existingUser) {
      existingUser = localDb.users.find(u => u.phone === withCountryCode || u.phone === digits || u.phone === phone);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'This mobile number is already registered. Please login directly.' });
    }

    const assignedRole = isAdminPhone(digits) ? 'Admin' : (role || 'Buyer');
    const userData = {
      _id: uid,
      firebaseUid: uid,
      phone: withCountryCode,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      role: assignedRole,
      pin: cleanPin,
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      try {
        const newUser = new User(userData);
        await newUser.save();
        userData._id = newUser._id;
      } catch (_) {}
    }

    localDb.users.push(userData);
    saveLocalDb(localDb);

    const token = jwt.sign(
      { uid: userData.firebaseUid, phone: userData.phone, role: userData.role, name: userData.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Account registered successfully',
      token,
      user: {
        id: userData.firebaseUid,
        firebaseUid: userData.firebaseUid,
        phone: userData.phone,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user is registered before login
app.post('/api/auth/check-user', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const digits = phone.replace(/\D/g, '').slice(-10);
    const withCountryCode = `+91${digits}`;

    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { phone: withCountryCode },
            { phone: digits },
            { phone: phone }
          ]
        });
      } catch (_) {}
    }
    if (!user) {
      user = localDb.users.find(u => u.phone === withCountryCode || u.phone === digits || u.phone === phone);
    }

    res.json({
      exists: !!user,
      hasPin: !!(user && user.pin),
      name: user?.name || null,
      email: user?.email || null,
      role: user?.role || 'Buyer'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Live PIN Login: Verify 4-digit PIN
app.post('/api/auth/login-pin', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone number and PIN are required' });
    }

    const digits = phone.replace(/\D/g, '').slice(-10);
    const withCountryCode = `+91${digits}`;

    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { phone: withCountryCode },
            { phone: digits },
            { phone: phone }
          ]
        });
      } catch (_) {}
    }
    if (!user) {
      user = localDb.users.find(u => u.phone === withCountryCode || u.phone === digits || u.phone === phone);
    }

    if (!user) {
      return res.status(404).json({ error: 'No account found for this mobile number. Please register or login with OTP first.' });
    }

    if (!user.pin) {
      return res.status(400).json({ error: 'No PIN has been configured for this account yet. Please register or set a PIN.' });
    }

    if (user.pin !== String(pin).trim()) {
      return res.status(401).json({ error: 'Incorrect PIN. Please try again.' });
    }

    if (isAdminPhone(digits)) {
      user.role = 'Admin';
      saveLocalDb(localDb);
    }

    const token = jwt.sign(
      { uid: user.firebaseUid, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.firebaseUid || user._id,
        name: user.name || (isAdminPhone(digits) ? 'Super Admin' : `User ${digits.slice(-4)}`),
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

// Set / Update 4-Digit PIN
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

    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { phone: withCountryCode },
            { phone: digits },
            { phone: phone }
          ]
        });
        if (user) {
          user.pin = cleanPin;
          await user.save();
        }
      } catch (_) {}
    }

    const localUser = localDb.users.find(u => u.phone === withCountryCode || u.phone === digits || u.phone === phone);
    if (localUser) {
      localUser.pin = cleanPin;
    } else {
      localDb.users.push({
        _id: `uid_${Date.now()}`,
        firebaseUid: `uid_${Date.now()}`,
        phone: withCountryCode,
        pin: cleanPin,
        role: 'Buyer',
        name: `User ${digits.slice(-4)}`
      });
    }
    saveLocalDb(localDb);

    res.json({ message: 'PIN saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync User from Firebase / Mock to Database
app.post('/api/users/sync', verifyToken, async (req, res) => {
  try {
    const { phone, name, email, role, pin } = req.body;
    const uid = req.user.uid || req.user.firebaseUid;
    const formattedPhone = phone || req.user.phone_number || req.user.phone || '';
    const digits = formattedPhone.replace(/\D/g, '').slice(-10);
    const withCountryCode = `+91${digits}`;

    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { firebaseUid: uid },
            ...(digits ? [{ phone: withCountryCode }, { phone: digits }] : [])
          ]
        });
        if (!user) {
          user = new User({
            firebaseUid: uid,
            phone: withCountryCode || formattedPhone,
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
          if (!user.phone && formattedPhone) user.phone = withCountryCode || formattedPhone;
          if (!user.firebaseUid || user.firebaseUid.startsWith('mock-token')) user.firebaseUid = uid;
          await user.save();
        }
      } catch (_) {}
    }

    let localUser = localDb.users.find(u => u.firebaseUid === uid || (digits && (u.phone === withCountryCode || u.phone === digits)));
    if (!localUser) {
      localUser = {
        _id: uid,
        firebaseUid: uid,
        phone: withCountryCode || formattedPhone,
        email: email || '',
        name: name || 'User',
        role: role || 'Buyer',
        pin: pin || undefined
      };
      localDb.users.push(localUser);
    } else {
      if (name) localUser.name = name;
      if (email) localUser.email = email;
      if (role) localUser.role = role;
      if (pin) localUser.pin = pin;
    }
    saveLocalDb(localDb);

    res.json({ message: 'User synced successfully', user: user || localUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User Session
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid || req.user.firebaseUid;
    let user = null;
    if (isMongoConnected()) {
      try { user = await User.findOne({ firebaseUid: uid }); } catch (_) {}
    }
    if (!user) {
      user = localDb.users.find(u => u.firebaseUid === uid || u._id === uid);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get all users
app.get('/api/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    let users = [];
    if (isMongoConnected()) {
      try { users = await User.find(); } catch (_) {}
    }
    if (!users || users.length === 0) {
      users = localDb.users;
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Delete a user
app.delete('/api/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      try {
        const user = await User.findById(id);
        if (user && admin.apps.length > 0) {
          try { await admin.auth().deleteUser(user.firebaseUid); } catch (_) {}
        }
        await User.findByIdAndDelete(id);
      } catch (_) {}
    }
    localDb.users = localDb.users.filter(u => u._id !== id && u.firebaseUid !== id);
    saveLocalDb(localDb);
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

    let properties = [];
    if (isMongoConnected()) {
      try {
        properties = await Property.find(filter).sort({ createdAt: -1 });
      } catch (_) {}
    }

    if (!properties || properties.length === 0) {
      let filtered = [...localDb.properties];
      if (district) filtered = filtered.filter(p => p.district === district);
      if (propertyType) filtered = filtered.filter(p => p.propertyType === propertyType);
      if (status) filtered = filtered.filter(p => p.status === status);
      properties = filtered;
    }

    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let property = null;
    if (isMongoConnected()) {
      try { property = await Property.findById(id); } catch (_) {}
    }
    if (!property) {
      property = localDb.properties.find(p => p.id === id || p._id === id);
    }
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new property
app.post('/api/properties', async (req, res) => {
  try {
    const id = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const propData = { ...req.body, _id: id, id, createdAt: new Date() };

    if (isMongoConnected()) {
      try {
        const newProperty = new Property(req.body);
        await newProperty.save();
        propData._id = newProperty._id;
        propData.id = newProperty._id.toString();
      } catch (_) {}
    }

    localDb.properties.unshift(propData);
    saveLocalDb(localDb);

    res.status(201).json(propData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let updated = null;
    if (isMongoConnected()) {
      try {
        updated = await Property.findByIdAndUpdate(id, req.body, { new: true });
      } catch (_) {}
    }
    const idx = localDb.properties.findIndex(p => p.id === id || p._id === id);
    if (idx >= 0) {
      localDb.properties[idx] = { ...localDb.properties[idx], ...req.body };
      saveLocalDb(localDb);
      if (!updated) updated = localDb.properties[idx];
    }
    if (!updated) return res.status(404).json({ error: 'Property not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      try { await Property.findByIdAndDelete(id); } catch (_) {}
    }
    localDb.properties = localDb.properties.filter(p => p.id !== id && p._id !== id);
    saveLocalDb(localDb);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get properties for a user
app.get('/api/properties/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    let properties = [];
    if (isMongoConnected()) {
      try {
        properties = await Property.find({ 'seller.id': userId }).sort({ createdAt: -1 });
      } catch (_) {}
    }
    if (!properties || properties.length === 0) {
      properties = localDb.properties.filter(p => p.seller && (p.seller.id === userId || p.seller.phone === userId));
    }
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get Dashboard Stats
app.get('/api/admin/dashboard-stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = isMongoConnected() ? (await User.countDocuments().catch(() => localDb.users.length)) : localDb.users.length;
    const buyers = isMongoConnected() ? (await User.countDocuments({ role: 'Buyer' }).catch(() => localDb.users.filter(u => u.role === 'Buyer').length)) : localDb.users.filter(u => u.role === 'Buyer').length;
    const sellers = isMongoConnected() ? (await User.countDocuments({ role: 'Seller' }).catch(() => localDb.users.filter(u => u.role === 'Seller').length)) : localDb.users.filter(u => u.role === 'Seller').length;
    const agents = isMongoConnected() ? (await User.countDocuments({ role: 'Agent' }).catch(() => localDb.users.filter(u => u.role === 'Agent').length)) : localDb.users.filter(u => u.role === 'Agent').length;

    const totalProperties = isMongoConnected() ? (await Property.countDocuments().catch(() => localDb.properties.length)) : localDb.properties.length;
    const publishedProps = isMongoConnected() ? (await Property.countDocuments({ status: 'Published' }).catch(() => localDb.properties.filter(p => p.status === 'Published').length)) : localDb.properties.filter(p => p.status === 'Published').length;
    const pendingProps = isMongoConnected() ? (await Property.countDocuments({ status: 'Pending' }).catch(() => localDb.properties.filter(p => p.status === 'Pending').length)) : localDb.properties.filter(p => p.status === 'Pending').length;

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
        openComplaints: 0
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
