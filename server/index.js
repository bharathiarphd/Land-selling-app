import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

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
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// --- Middleware ---
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const dbUser = await User.findOne({ firebaseUid: req.user.uid });
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

// Sync User from Firebase Phone Auth to MongoDB
app.post('/api/users/sync', verifyToken, async (req, res) => {
  try {
    const { phone, name, email, role } = req.body;
    let user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      user = new User({
        firebaseUid: req.user.uid,
        phone: phone || req.user.phone_number,
        email: email || '',
        name: name || 'Demo User',
        role: role || 'Buyer'
      });
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
    const user = await User.findOne({ firebaseUid: req.user.uid });
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

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
