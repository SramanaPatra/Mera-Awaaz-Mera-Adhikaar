import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import welfareRoutes from './routes/welfare.js';
import complaintsRoutes from './routes/complaints.js';
import adminRoutes from './routes/admin.js';
import emergencyRoutes from './routes/emergency.js';
import chatbotRoutes from './routes/chatbot.js';
import speechRoutes from './routes/speech.js';
import { runEscalationCheck } from './services/escalationScheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use('/api/auth', authRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/speech', speechRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

setInterval(() => {
  runEscalationCheck(48);
}, 60000);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
