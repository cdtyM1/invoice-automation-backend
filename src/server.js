import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import { startReminderJob } from './jobs/reminderJob.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'API running', timestamp: new Date() });
});

app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);

startReminderJob();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✓ API running on http://localhost:${port}`);
  console.log(`✓ Health check: http://localhost:${port}/health`);
});
