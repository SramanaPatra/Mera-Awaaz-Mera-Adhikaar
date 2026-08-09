import express from 'express';
import fs from 'fs';
import path from 'path';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();
const DATA_DIR = path.resolve('server/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const loadUsersFromDisk = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return [
    {
      id: 1,
      email: 'citizen@adhikar.gov.in',
      password: 'citizen123',
      name: 'Verified Citizen User',
      role: 'citizen',
      department: 'Public Affairs',
      age: 32,
      gender: 'Male',
      location: 'New Delhi, DL',
      income: '350000',
      occupation: 'Artisan'
    },
    {
      id: 2,
      email: 'admin@adhikar.gov.in',
      password: 'admin123',
      name: 'Officer S. Patra',
      role: 'authority',
      department: 'Municipal Operations Command',
      age: 45,
      gender: 'Female',
      location: 'New Delhi, DL',
      income: '1200000',
      occupation: 'Government Executive'
    }
  ];
};

let users = loadUsersFromDisk();

const saveUsersToDisk = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {}
};

router.post('/register', (req, res) => {
  const { email, password, name, role, age, gender, location, income, occupation, department } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and full legal name are required'
    });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please login instead.'
    });
  }

  const newUser = {
    id: users.length + 1,
    email: email.toLowerCase(),
    password,
    name,
    role: role || 'citizen',
    department: department || (role === 'authority' ? 'Municipal Operations' : 'Citizen Self-Service'),
    age: Number(age) || 30,
    gender: gender || 'All',
    location: location || 'Verified Jurisdiction',
    income: String(income || '300000'),
    occupation: occupation || 'General'
  };

  users.push(newUser);
  saveUsersToDisk();

  const token = generateToken(newUser);

  res.json({
    success: true,
    message: 'User account created successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      age: newUser.age,
      gender: newUser.gender,
      location: newUser.location,
      income: newUser.income,
      occupation: newUser.occupation
    }
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Account not found. Please click Create Account to register.'
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect security passcode. Please check your password.'
    });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      age: user.age,
      gender: user.gender,
      location: user.location,
      income: user.income,
      occupation: user.occupation
    }
  });
});

router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: req.user || null
  });
});

export default router;
