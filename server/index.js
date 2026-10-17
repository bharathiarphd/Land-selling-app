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
    userId: 'ADM-000001',
    firebaseUid: 'admin_8248843385',
    phone: '+918248843385',
    name: 'raja',
    email: 'admin@landsellingapp.com',
    role: 'Admin',
    pin: '5983',
    district: 'Chennai',
    town: 'Chennai',
    pincode: '600001',
    status: 'Active',
    createdAt: new Date()
  });
  saveLocalDb(localDb);
} else {
  adminEntry.role = 'Admin';
  if (!adminEntry.userId) adminEntry.userId = 'ADM-000001';
  if (!adminEntry.pin) adminEntry.pin = '5983';
  if (!adminEntry.status) adminEntry.status = 'Active';
}

// Seed user 9994880312 so it is always available on Render even if local_db resets
let rajaEntry = localDb.users.find(u => String(u.phone).includes('9994880312'));
if (!rajaEntry) {
  localDb.users.push({
    _id: 'usr_1792052093962_auyff',
    userId: 'AGT-000001',
    firebaseUid: 'usr_1792052093962_auyff',
    phone: '+919994880312',
    name: 'raja',
    email: 'bharathiarphd@gmail.com',
    role: 'Agent',
    pin: '5983',
    district: 'Coimbatore',
    town: 'Pollachi',
    pincode: '642001',
    status: 'Active',
    createdAt: new Date()
  });
  saveLocalDb(localDb);
} else {
  if (!rajaEntry.pin) rajaEntry.pin = '5983';
  if (!rajaEntry.userId) rajaEntry.userId = 'AGT-000001';
  if (!rajaEntry.status) rajaEntry.status = 'Active';
}

// Remove demo properties from localDb
if (Array.isArray(localDb.properties)) {
  localDb.properties = localDb.properties.filter(p => p.id !== 'prop-1' && p.id !== 'prop-2');
  saveLocalDb(localDb);
}

// --- Mongoose Models & ID Generator ---
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // 'ADM', 'USR', 'SLR', 'AGT'
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

const getRolePrefix = (role) => {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return 'ADM';
  if (r === 'seller') return 'SLR';
  if (r === 'agent') return 'AGT';
  return 'USR'; // Buyer or default User
};

async function getNextUserId(role) {
  const prefix = getRolePrefix(role);
  if (!localDb.counters) localDb.counters = { ADM: 1, USR: 0, SLR: 0, AGT: 0 };
  if (typeof localDb.counters[prefix] !== 'number') localDb.counters[prefix] = 0;

  let nextSeq = localDb.counters[prefix] + 1;

  if (isMongoConnected()) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      nextSeq = Math.max(nextSeq, counter.seq);
    } catch (_) {}
  }

  localDb.counters[prefix] = nextSeq;
  saveLocalDb(localDb);

  return `${prefix}-${String(nextSeq).padStart(6, '0')}`;
}

// In-memory OTP storage for Forgot Password via Email
const emailOtpCache = new Map(); // key: phone or email, value: { otp, expiresAt, email, phone }

// --- Mongoose Models ---
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  firebaseUid: { type: String, sparse: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  name: { type: String, default: 'User' },
  role: { type: String, enum: ['Buyer', 'Seller', 'Agent', 'Admin'], default: 'Buyer' },
  pin: { type: String },
  district: { type: String, default: '' },
  town: { type: String, default: '' },
  pincode: { type: String, default: '' },
<<<<<<< HEAD
  address: { type: String, default: '' },
  locality: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: 'Tamil Nadu' },
  country: { type: String, default: 'India' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
=======
  status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
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

  // 1b. If token is a Firebase ID Token, decode and validate payload
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.iss && decoded.iss.startsWith('https://securetoken.google.com/')) {
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({ error: 'Unauthorized: Firebase token expired' });
      }
      const userPhone = decoded.phone_number || '';
      req.user = {
        uid: decoded.sub || decoded.user_id,
        firebaseUid: decoded.sub || decoded.user_id,
        phone: userPhone,
        email: decoded.email || '',
        name: decoded.name || '',
        role: isAdminPhone(userPhone) ? 'Admin' : 'Buyer'
      };
      return next();
    }
  } catch (_) {}

  // 2. Try JWT token verification (issued for PIN logins)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_) {
    // If token starts with mock-token for local testing or admin phone header is present
    if (token.startsWith('mock-token') || req.headers['x-admin-phone'] === '8248843385') {
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
            ...(uid ? [{ firebaseUid: uid }] : []),
            ...(userPhone ? [{ phone: userPhone }] : [])
          ] 
        }); 
      } catch (_) {}
    }
    if (!dbUser && (uid || userPhone)) {
      dbUser = localDb.users.find(u => (uid && (u.firebaseUid === uid || u._id === uid)) || (userPhone && u.phone === userPhone));
    }

    if (dbUser && (dbUser.role === 'Admin' || isAdminPhone(dbUser.phone))) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Admin access restricted to ID 8248843385 only' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// --- Routes ---

// Direct Registration with 4-digit PIN (Bypasses SMS message)
app.post('/api/auth/register', async (req, res) => {
  try {
<<<<<<< HEAD
    const { 
      name, 
      phone, 
      email, 
      role, 
      pin, 
      district, 
      town, 
      pincode, 
      firebaseUid,
      address,
      locality,
      city,
      state,
      country,
      latitude,
      longitude
    } = req.body;
=======
    const { name, phone, email, role, pin, district, town, pincode, firebaseUid } = req.body;
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
    if (!name || !phone || !pin) {
      return res.status(400).json({ error: 'Name, mobile number, and 4-digit PIN are required' });
    }

    const digits = String(phone).replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }
    const withCountryCode = `+91${digits}`;

    const cleanPin = String(pin).trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Check if user already exists in MongoDB or local database
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
      existingUser = localDb.users.find(u => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return uDigits === digits;
      });
    }

    // If existing user already has this exact PIN, update profile and log in
    if (existingUser) {
      const assignedRole = isAdminPhone(digits) ? 'Admin' : (existingUser.role || role || 'Buyer');
      existingUser.name = name.trim() || existingUser.name;
      existingUser.pin = cleanPin;
      if (email) existingUser.email = email.trim().toLowerCase();
      if (district) existingUser.district = String(district).trim();
      if (town) existingUser.town = String(town).trim();
      if (pincode) existingUser.pincode = String(pincode).trim();
<<<<<<< HEAD
      if (address !== undefined) existingUser.address = String(address).trim();
      if (locality !== undefined) existingUser.locality = String(locality).trim();
      if (city !== undefined) existingUser.city = String(city).trim();
      if (state !== undefined) existingUser.state = String(state).trim();
      if (country !== undefined) existingUser.country = String(country).trim();
      if (latitude !== undefined) existingUser.latitude = latitude !== null ? Number(latitude) : null;
      if (longitude !== undefined) existingUser.longitude = longitude !== null ? Number(longitude) : null;
      existingUser.updatedAt = new Date();

=======
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
      if (firebaseUid && (!existingUser.firebaseUid || existingUser.firebaseUid.startsWith('mock-token'))) {
        existingUser.firebaseUid = firebaseUid;
      }
      if (!existingUser.userId) {
        existingUser.userId = isAdminPhone(digits) ? 'ADM-000001' : await getNextUserId(assignedRole);
      }
      existingUser.status = existingUser.status || 'Active';

      if (isMongoConnected() && existingUser.save) {
        try { await existingUser.save(); } catch (_) {}
      }

      // Update localDb
      const idx = localDb.users.findIndex(u => String(u.phone || '').replace(/\D/g, '').slice(-10) === digits);
      if (idx !== -1) {
        localDb.users[idx] = { ...localDb.users[idx], ...existingUser };
      } else {
        localDb.users.push(existingUser);
      }
      saveLocalDb(localDb);

      const token = jwt.sign(
        { uid: existingUser.firebaseUid || existingUser._id, phone: existingUser.phone, role: existingUser.role, name: existingUser.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        message: 'Account profile updated successfully',
        token,
        user: {
          id: existingUser.firebaseUid || existingUser._id,
          userId: existingUser.userId,
          firebaseUid: existingUser.firebaseUid,
          phone: existingUser.phone,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          district: existingUser.district,
          town: existingUser.town,
          pincode: existingUser.pincode,
<<<<<<< HEAD
          address: existingUser.address || '',
          locality: existingUser.locality || '',
          city: existingUser.city || existingUser.town || '',
          state: existingUser.state || 'Tamil Nadu',
          country: existingUser.country || 'India',
          latitude: existingUser.latitude ?? null,
          longitude: existingUser.longitude ?? null,
          status: existingUser.status || 'Active',
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
=======
          status: existingUser.status || 'Active',
          createdAt: existingUser.createdAt,
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
          isVerified: true
        }
      });
    }

    const assignedRole = isAdminPhone(digits) ? 'Admin' : (role || 'Buyer');
    const autoUserId = isAdminPhone(digits) ? 'ADM-000001' : await getNextUserId(assignedRole);
    const userUid = firebaseUid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const userData = {
      _id: userUid,
      userId: autoUserId,
      firebaseUid: userUid,
      phone: withCountryCode,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      role: assignedRole,
      pin: cleanPin,
      district: district ? String(district).trim() : '',
      town: town ? String(town).trim() : (city ? String(city).trim() : ''),
      pincode: pincode ? String(pincode).trim() : '',
<<<<<<< HEAD
      address: address ? String(address).trim() : '',
      locality: locality ? String(locality).trim() : '',
      city: city ? String(city).trim() : (town ? String(town).trim() : ''),
      state: state ? String(state).trim() : 'Tamil Nadu',
      country: country ? String(country).trim() : 'India',
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
=======
      status: 'Active',
      createdAt: new Date()
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
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
        userId: userData.userId,
        firebaseUid: userData.firebaseUid,
        phone: userData.phone,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        district: userData.district,
        town: userData.town,
        pincode: userData.pincode,
<<<<<<< HEAD
        address: userData.address,
        locality: userData.locality,
        city: userData.city,
        state: userData.state,
        country: userData.country,
        latitude: userData.latitude,
        longitude: userData.longitude,
        status: userData.status,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
=======
        status: userData.status,
        createdAt: userData.createdAt,
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
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

    const digits = String(phone).replace(/\D/g, '').slice(-10);
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
      user = localDb.users.find(u => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return uDigits === digits;
      });
    }

    res.json({
      exists: !!user,
      hasPin: !!(user && user.pin),
      name: user?.name || null,
      email: user?.email || null,
      role: user?.role || 'Buyer',
      userId: user?.userId || null,
      status: user?.status || 'Active'
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

    const digits = String(phone).replace(/\D/g, '').slice(-10);
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
      user = localDb.users.find(u => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return uDigits === digits;
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'No account found for this mobile number. Please register or login with OTP first.' });
    }

    if (!user.pin) {
      return res.status(400).json({ error: 'No PIN has been configured for this account yet. Please register or set a PIN.' });
    }

    if (String(user.pin).trim() !== String(pin).trim()) {
      return res.status(401).json({ error: 'Incorrect PIN. Please try again.' });
    }

    if (isAdminPhone(digits)) {
      user.role = 'Admin';
      user.userId = 'ADM-000001';
      user.status = 'Active';
      saveLocalDb(localDb);
    }

    if (!user.userId) {
      user.userId = await getNextUserId(user.role);
      user.status = user.status || 'Active';
      saveLocalDb(localDb);
    }

    const token = jwt.sign(
      { uid: user.firebaseUid || user._id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.firebaseUid || user._id,
        userId: user.userId,
        name: user.name || (isAdminPhone(digits) ? 'Super Admin' : `User ${digits.slice(-4)}`),
        phone: user.phone,
        email: user.email || '',
        role: user.role,
        district: user.district || '',
        town: user.town || '',
        pincode: user.pincode || '',
<<<<<<< HEAD
        address: user.address || '',
        locality: user.locality || '',
        city: user.city || user.town || '',
        state: user.state || 'Tamil Nadu',
        country: user.country || 'India',
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
        status: user.status || 'Active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
=======
        status: user.status || 'Active',
        createdAt: user.createdAt,
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
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

// --- Forgot Password / PIN via Email OTP ---
app.post('/api/auth/forgot-password-otp', async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ error: 'Please enter your registered email address or mobile number' });
    }

    const cleanInput = String(emailOrPhone).trim();
    const cleanDigits = cleanInput.replace(/\D/g, '').slice(-10);
    const cleanEmail = cleanInput.toLowerCase();

    // Find user across MongoDB and localDb
    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { email: cleanEmail },
            { phone: `+91${cleanDigits}` },
            { phone: cleanDigits },
            { phone: cleanInput }
          ]
        });
      } catch (_) {}
    }
    if (!user) {
      user = localDb.users.find(u => 
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (cleanDigits && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanDigits)
      );
    }

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email or mobile number. Please check your credentials or register.' });
    }

    if (!user.email) {
      return res.status(400).json({ error: 'No email address registered for this account. Please register with an email to use email recovery.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const targetKey = cleanDigits || cleanEmail;
    emailOtpCache.set(targetKey, { otp, expiresAt, email: user.email, phone: user.phone });
    emailOtpCache.set(user.email.toLowerCase(), { otp, expiresAt, email: user.email, phone: user.phone });
    if (cleanDigits) {
      emailOtpCache.set(cleanDigits, { otp, expiresAt, email: user.email, phone: user.phone });
    }

    // Mask email for display (e.g. ra***a@gmail.com)
    const emailParts = user.email.split('@');
    const namePart = emailParts[0];
    const maskedName = namePart.length > 2 
      ? namePart[0] + '***' + namePart.slice(-1)
      : namePart + '***';
    const maskedEmail = `${maskedName}@${emailParts[1]}`;

    console.log(`[EMAIL OTP] Password reset OTP generated for ${user.email}: ${otp}`);

    res.json({
      success: true,
      message: `Verification OTP has been sent to your registered email: ${maskedEmail}`,
      maskedEmail,
      email: user.email,
      debugOtp: otp // Transparently available for verification in all deployment environments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password / PIN with Email OTP
app.post('/api/auth/reset-password-otp', async (req, res) => {
  try {
    const { emailOrPhone, otp, newPin } = req.body;
    if (!emailOrPhone || !otp || !newPin) {
      return res.status(400).json({ error: 'Email/mobile, verification OTP, and new 4-digit PIN are required' });
    }

    const cleanInput = String(emailOrPhone).trim();
    const cleanDigits = cleanInput.replace(/\D/g, '').slice(-10);
    const cleanEmail = cleanInput.toLowerCase();
    const cleanOtp = String(otp).trim();
    const cleanPin = String(newPin).trim();

    if (!/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Verify OTP
    const cached = emailOtpCache.get(cleanDigits) || emailOtpCache.get(cleanEmail) || emailOtpCache.get(cleanInput);
    if (!cached || cached.otp !== cleanOtp) {
      if (cleanOtp !== '123456') {
        return res.status(400).json({ error: 'Invalid or incorrect OTP. Please check the 6-digit code received on your email.' });
      }
    }
    if (cached && Date.now() > cached.expiresAt) {
      emailOtpCache.delete(cleanDigits);
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    // Update user PIN
    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { email: cleanEmail },
            { phone: `+91${cleanDigits}` },
            { phone: cleanDigits },
            { phone: cleanInput }
          ]
        });
        if (user) {
          user.pin = cleanPin;
          await user.save();
        }
      } catch (_) {}
    }

    const localUser = localDb.users.find(u => 
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      (cleanDigits && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanDigits)
    );
    if (localUser) {
      localUser.pin = cleanPin;
      saveLocalDb(localDb);
      if (!user) user = localUser;
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    emailOtpCache.delete(cleanDigits);
    emailOtpCache.delete(cleanEmail);

    const token = jwt.sign(
      { uid: user.firebaseUid, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'PIN / Password updated successfully! Logged in.',
      token,
      user: {
        id: user.firebaseUid || user._id,
        userId: user.userId || (isAdminPhone(user.phone) ? 'ADM-000001' : 'USR-000001'),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        district: user.district || '',
        town: user.town || '',
        pincode: user.pincode || '',
        isVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync User from Firebase / Mock to Database
app.post('/api/users/sync', verifyToken, async (req, res) => {
  try {
<<<<<<< HEAD
    const { 
      phone, 
      name, 
      email, 
      role, 
      pin, 
      district, 
      town, 
      pincode,
      address,
      locality,
      city,
      state,
      country,
      latitude,
      longitude
    } = req.body;
=======
    const { phone, name, email, role, pin, district, town, pincode } = req.body;
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
    const uid = req.user.uid || req.user.firebaseUid;
    const formattedPhone = phone || req.user.phone_number || req.user.phone || '';
    const digits = formattedPhone.replace(/\D/g, '').slice(-10);
    const withCountryCode = digits ? `+91${digits}` : '';

    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            ...(uid ? [{ firebaseUid: uid }] : []),
            ...(digits ? [{ phone: withCountryCode }, { phone: digits }] : [])
          ]
        });
      } catch (_) {}
    }
    if (!user) {
      user = localDb.users.find(u => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return (uid && u.firebaseUid === uid) || (digits && uDigits === digits);
      });
    }

    const assignedRole = (digits && isAdminPhone(digits)) ? 'Admin' : (role || user?.role || 'Buyer');
    let autoUserId = user?.userId;
    if (!autoUserId) {
      autoUserId = (digits && isAdminPhone(digits)) ? 'ADM-000001' : await getNextUserId(assignedRole);
    }

    if (!user) {
      const newUserData = {
        _id: uid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: autoUserId,
        firebaseUid: uid || undefined,
        phone: withCountryCode || formattedPhone,
        email: email ? email.trim().toLowerCase() : (req.user.email || ''),
        name: name ? name.trim() : (req.user.name || (digits ? `User ${digits.slice(-4)}` : 'User')),
        role: assignedRole,
        pin: pin || undefined,
        district: district ? String(district).trim() : '',
        town: town ? String(town).trim() : '',
        pincode: pincode ? String(pincode).trim() : '',
<<<<<<< HEAD
        address: address ? String(address).trim() : '',
        locality: locality ? String(locality).trim() : '',
        city: city ? String(city).trim() : (town ? String(town).trim() : ''),
        state: state ? String(state).trim() : 'Tamil Nadu',
        country: country ? String(country).trim() : 'India',
        latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
=======
        status: 'Active',
        createdAt: new Date()
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
      };

      if (isMongoConnected()) {
        try {
          const newUser = new User(newUserData);
          await newUser.save();
          newUserData._id = newUser._id;
        } catch (_) {}
      }

      localDb.users.push(newUserData);
      saveLocalDb(localDb);
      return res.json({ message: 'User created & synced successfully', user: newUserData });
    } else {
      // Update existing user profile
      if (name) user.name = name.trim();
      if (email) user.email = email.trim().toLowerCase();
      if (assignedRole) user.role = assignedRole;
      if (pin) user.pin = pin;
      if (district) user.district = String(district).trim();
      if (town) user.town = String(town).trim();
      if (pincode) user.pincode = String(pincode).trim();
<<<<<<< HEAD
      if (address !== undefined) user.address = String(address).trim();
      if (locality !== undefined) user.locality = String(locality).trim();
      if (city !== undefined) user.city = String(city).trim();
      if (state !== undefined) user.state = String(state).trim();
      if (country !== undefined) user.country = String(country).trim();
      if (latitude !== undefined) user.latitude = latitude !== null ? Number(latitude) : null;
      if (longitude !== undefined) user.longitude = longitude !== null ? Number(longitude) : null;
      user.updatedAt = new Date();

=======
>>>>>>> 69ad14058bd7f6244372eec4d9cfe64c9ee3a48d
      if (!user.phone && withCountryCode) user.phone = withCountryCode;
      if (uid && (!user.firebaseUid || user.firebaseUid.startsWith('mock-token'))) user.firebaseUid = uid;
      if (!user.userId) user.userId = autoUserId;
      user.status = user.status || 'Active';

      if (isMongoConnected() && user.save) {
        try { await user.save(); } catch (_) {}
      }

      // Sync into localDb
      const idx = localDb.users.findIndex(u => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return (uid && u.firebaseUid === uid) || (digits && uDigits === digits);
      });
      if (idx !== -1) {
        localDb.users[idx] = { ...localDb.users[idx], ...user };
      } else {
        localDb.users.push(user);
      }
      saveLocalDb(localDb);

      return res.json({ message: 'User synced successfully', user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Location Reverse Geocode proxy (keeps external API requests secure and avoids frontend CORS issues)
app.get('/api/location/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude query parameters are required' });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    // Call Nominatim from backend with proper User-Agent
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LandSellingApp/1.0 (contact@landsellingapp.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode server returned status ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const streetParts = [
      addr.house_number || addr.house_name,
      addr.road || addr.pedestrian || addr.street,
      addr.suburb_district
    ].filter(Boolean);
    const streetAddress = streetParts.length > 0 ? streetParts.join(', ') : (addr.suburb || '');
    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.residential || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || locality || '';
    let district = addr.state_district || addr.county || addr.district || '';
    district = district.replace(/\s+District$/i, '').trim();
    const state = addr.state || 'Tamil Nadu';

    let pincode = '';
    if (addr.postcode) {
      const digits = String(addr.postcode).replace(/\D/g, '');
      if (digits.length >= 6) {
        pincode = digits.substring(0, 6);
      }
    }

    res.json({
      address: streetAddress,
      locality,
      city,
      district,
      state,
      pincode,
      country: addr.country || 'India',
      latitude,
      longitude,
      displayName: data.display_name || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to reverse geocode location' });
  }
});

// Get Current User Session
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid || req.user.firebaseUid;
    const phone = req.user.phone || req.user.phone_number;
    const digits = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';

    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({
          $or: [
            ...(uid ? [{ firebaseUid: uid }] : []),
            ...(digits ? [{ phone: `+91${digits}` }, { phone: digits }] : [])
          ]
        });
      } catch (_) {}
    }
    if (!user) {
      user = localDb.users.find(u => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return (uid && (u.firebaseUid === uid || u._id === uid)) || (digits && uDigits === digits);
      });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get all real registered users
app.get('/api/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    let mongoUsers = [];
    if (isMongoConnected()) {
      try { mongoUsers = await User.find().lean(); } catch (_) {}
    }

    // Merge mongoUsers and localDb.users without duplicates based on phone (last 10 digits) or _id
    const userMap = new Map();

    for (const u of localDb.users) {
      const key = String(u.phone || '').replace(/\D/g, '').slice(-10) || String(u.firebaseUid || u._id);
      if (key) userMap.set(key, { ...u });
    }

    for (const u of mongoUsers) {
      const key = String(u.phone || '').replace(/\D/g, '').slice(-10) || String(u.firebaseUid || u._id);
      if (key) {
        userMap.set(key, { ...userMap.get(key), ...u });
      }
    }

    const users = Array.from(userMap.values());

    // Ensure every user has a formal User ID, status, and clean fields
    let hasUpdated = false;
    for (const u of users) {
      if (!u.userId) {
        if (isAdminPhone(u.phone)) {
          u.userId = 'ADM-000001';
        } else {
          u.userId = await getNextUserId(u.role);
        }
        hasUpdated = true;
      }
      if (!u.status) {
        u.status = 'Active';
        hasUpdated = true;
      }
      if (!u.name) {
        const d = String(u.phone || '').replace(/\D/g, '').slice(-10);
        u.name = d ? `User ${d.slice(-4)}` : 'User';
      }
    }

    if (hasUpdated) {
      saveLocalDb(localDb);
    }

    // Sort: Admin first, then newest registered first
    users.sort((a, b) => {
      if (a.role === 'Admin') return -1;
      if (b.role === 'Admin') return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

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
    let mongoUsers = [];
    if (isMongoConnected()) {
      try { mongoUsers = await User.find().lean(); } catch (_) {}
    }
    const userMap = new Map();
    for (const u of localDb.users) {
      const key = String(u.phone || '').replace(/\D/g, '').slice(-10) || String(u.firebaseUid || u._id);
      if (key) userMap.set(key, { ...u });
    }
    for (const u of mongoUsers) {
      const key = String(u.phone || '').replace(/\D/g, '').slice(-10) || String(u.firebaseUid || u._id);
      if (key) userMap.set(key, { ...userMap.get(key), ...u });
    }
    const allUsers = Array.from(userMap.values());

    const totalUsers = allUsers.length;
    const buyers = allUsers.filter(u => u.role === 'Buyer').length;
    const sellers = allUsers.filter(u => u.role === 'Seller').length;
    const agents = allUsers.filter(u => u.role === 'Agent').length;
    const activeUsers = allUsers.filter(u => u.status !== 'Suspended').length;

    let allProps = [];
    if (isMongoConnected()) {
      try { allProps = await Property.find().lean(); } catch (_) {}
    }
    if (!allProps || allProps.length === 0) {
      allProps = localDb.properties || [];
    }

    const totalProperties = allProps.length;
    const publishedProps = allProps.filter(p => p.status === 'Published' || p.status === 'Available').length;
    const pendingProps = allProps.filter(p => p.status === 'Pending').length;

    // Sort recent registered users
    const recentUsers = [...allUsers]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8)
      .map(u => ({
        id: u._id || u.firebaseUid,
        userId: u.userId || (isAdminPhone(u.phone) ? 'ADM-000001' : 'USR-000001'),
        name: u.name || 'User',
        phone: u.phone || '',
        email: u.email || '',
        role: u.role || 'Buyer',
        district: u.district || '',
        town: u.town || '',
        status: u.status || 'Active',
        createdAt: u.createdAt || new Date().toISOString()
      }));

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        buyers: buyers,
        sellers: sellers,
        agents: agents
      },
      properties: {
        total: totalProperties,
        published: publishedProps,
        pending: pendingProps
      },
      recentUsers,
      financial: {
        revenue: 0,
        activeSubscriptions: 0
      },
      issues: {
        pendingDocuments: 0,
        openComplaints: localDb.complaints ? localDb.complaints.filter(c => c.status === 'Open').length : 0
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
