import express from 'express';
import { signToken, decodeToken } from '../middleware/auth.js';

const router = express.Router();

const DEMO_USERS = [
  {
    id: 'usr-cit-101',
    email: 'citizen@adhikar.gov.in',
    password: 'citizen123',
    name: 'Verified Citizen User',
    role: 'citizen'
  },
  {
    id: 'usr-adm-501',
    email: 'admin@adhikar.gov.in',
    password: 'admin123',
    name: 'Municipal Executive Officer',
    role: 'authority',
    department: 'Central Municipal Governance'
  },
  {
    id: 'usr-adm-502',
    email: 'officer@adhikar.gov.in',
    password: 'officer123',
    name: 'Chief Grievance Inspector',
    role: 'authority',
    department: 'Civic SLA Audit Bureau'
  }
];

router.post('/login', (req, res) => {
  const { email, password, requestedRole } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const effectiveRole = requestedRole || (normalizedEmail.includes('admin') || normalizedEmail.includes('officer') ? 'authority' : 'citizen');

  let user = DEMO_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      password: password || 'citizen123',
      name: effectiveRole === 'authority' ? 'Municipal Authority Officer' : 'Verified Citizen User',
      role: effectiveRole,
      department: effectiveRole === 'authority' ? 'Civic Governance' : 'Citizen Services'
    };
    DEMO_USERS.push(user);
  } else {
    if (password && password.trim()) {
      user.password = password;
    }
    user.role = effectiveRole;
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department || 'Citizen Services'
  };

  const token = signToken(tokenPayload);

  res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: tokenPayload
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeToken(token);

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid session' });
  }

  res.json({ success: true, user: payload });
});

export default router;
