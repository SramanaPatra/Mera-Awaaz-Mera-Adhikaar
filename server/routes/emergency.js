import express from 'express';
import { dbState } from '../db.js';

const router = express.Router();

router.get('/active-signals', (req, res) => {
  const active = dbState.emergencySignals.filter(s => s.status === 'ACTIVE');
  res.json({
    success: true,
    count: active.length,
    data: active
  });
});

router.post('/live-track', (req, res) => {
  const { userSession, latitude, longitude, accuracy } = req.body;

  if (!userSession || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, message: 'Invalid GPS telemetry data' });
  }

  let signal = dbState.emergencySignals.find(s => s.user_session === userSession && s.status === 'ACTIVE');

  if (signal) {
    signal.latitude = Number(latitude);
    signal.longitude = Number(longitude);
    signal.accuracy = Number(accuracy) || 10;
    signal.updated_at = new Date().toISOString();
  } else {
    signal = {
      id: `EMG-${Math.floor(100000 + Math.random() * 900000)}`,
      user_session: userSession,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: Number(accuracy) || 10,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbState.emergencySignals.unshift(signal);
  }

  res.json({
    success: true,
    message: 'Live emergency location updated',
    data: signal
  });
});

router.post('/stop-track', (req, res) => {
  const { userSession } = req.body;

  const signal = dbState.emergencySignals.find(s => s.user_session === userSession && s.status === 'ACTIVE');
  if (signal) {
    signal.status = 'STOPPED';
    signal.updated_at = new Date().toISOString();
  }

  res.json({
    success: true,
    message: 'Emergency location sharing deactivated'
  });
});

export default router;
