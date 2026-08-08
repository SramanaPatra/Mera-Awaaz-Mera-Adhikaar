import express from 'express';
import { dbState } from '../db.js';
import { findMatchingSchemes } from '../services/matchingEngine.js';

const router = express.Router();

router.get('/schemes', (req, res) => {
  res.json({
    success: true,
    data: dbState.schemes
  });
});

router.post('/match', (req, res) => {
  const { income, location, occupation, customOccupation } = req.body;
  if (!income) {
    return res.status(400).json({
      success: false,
      message: 'Income criteria required for algorithmic evaluation'
    });
  }

  const matches = findMatchingSchemes(income, location, occupation, customOccupation);
  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

router.post('/apply', (req, res) => {
  const { scheme_id, citizen_name, income, occupation, location } = req.body;

  if (!scheme_id || !citizen_name) {
    return res.status(400).json({
      success: false,
      message: 'Scheme ID and Citizen Name are required'
    });
  }

  const application = {
    id: dbState.applications.length + 101,
    scheme_id: Number(scheme_id),
    citizen_name,
    income: Number(income) || 0,
    occupation: occupation || 'General Citizen',
    location: location || 'General',
    status: 'Under Review',
    submitted_at: new Date().toISOString()
  };

  dbState.applications.push(application);

  res.json({
    success: true,
    message: 'Application recorded successfully',
    data: application
  });
});

export default router;
