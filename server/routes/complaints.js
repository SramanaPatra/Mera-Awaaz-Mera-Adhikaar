import express from 'express';
import fs from 'fs';
import path from 'path';
import { dbState } from '../db.js';

const router = express.Router();
const DATA_DIR = path.resolve('server/data');
const DATA_FILE = path.join(DATA_DIR, 'complaints.json');

const loadComplaintsFromDisk = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        dbState.complaints = parsed;
      }
    }
  } catch (e) {}
};

const saveComplaintsToDisk = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbState.complaints, null, 2));
  } catch (e) {}
};

loadComplaintsFromDisk();

router.get('/', (req, res) => {
  const { status, category } = req.query;
  let filtered = [...dbState.complaints];

  if (status && status !== 'All') {
    filtered = filtered.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  filtered.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

router.post('/', (req, res) => {
  const { title, category, description, urgency, latitude, longitude, location_name, location_descriptor } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title, Category, and Description are required'
    });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const complaintId = `CMP-${randomNum}`;

  const newComplaint = {
    id: complaintId,
    tracking_hash: `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}`,
    title,
    category,
    description,
    urgency: urgency || 'Medium Priority',
    latitude: Number(latitude) || 28.6139,
    longitude: Number(longitude) || 77.2090,
    location_descriptor: location_descriptor || location_name || 'Verified Location',
    location_name: location_name || location_descriptor || 'Verified Location',
    status: 'Pending',
    upvotes: 1,
    reported_at: new Date().toISOString(),
    resolved_at: null,
    resolution_note: null
  };

  dbState.complaints.unshift(newComplaint);
  saveComplaintsToDisk();

  res.json({
    success: true,
    message: 'Civic issue logged anonymously with geolocation parameters',
    data: newComplaint
  });
});

router.post('/:id/upvote', (req, res) => {
  const complaint = dbState.complaints.find(c => c.id === req.params.id || c.tracking_hash === req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.upvotes = (complaint.upvotes || 0) + 1;
  saveComplaintsToDisk();

  res.json({
    success: true,
    data: {
      upvotes: complaint.upvotes
    }
  });
});

export default router;
