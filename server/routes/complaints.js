import express from 'express';
import { dbState } from '../db.js';

const router = express.Router();

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
  const { title, category, description, urgency, latitude, longitude, location_name } = req.body;

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
    title,
    category,
    description,
    urgency: urgency || 'Medium',
    latitude: Number(latitude) || 40.7128,
    longitude: Number(longitude) || -74.0060,
    location_name: location_name || 'Geo-Tagged Location',
    status: 'Pending',
    upvotes: 1,
    reported_at: new Date().toISOString(),
    resolved_at: null,
    resolution_note: null
  };

  dbState.complaints.unshift(newComplaint);

  res.json({
    success: true,
    message: 'Civic issue logged anonymously with geolocation parameters',
    data: newComplaint
  });
});

router.post('/:id/upvote', (req, res) => {
  const complaint = dbState.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.upvotes += 1;
  res.json({
    success: true,
    upvotes: complaint.upvotes
  });
});

export default router;
