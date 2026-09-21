import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import towerRoutes from './routes/towerRoutes';
import assetRoutes from './routes/assetRoutes';
import powerSystemRoutes from './routes/powerSystemRoutes';
import batteryRoutes from './routes/batteryRoutes';
import inspectionRoutes from './routes/inspectionRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import outageRoutes from './routes/outageRoutes';
import alertRoutes from './routes/alertRoutes';
import technicianRoutes from './routes/technicianRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://telecom-tower-fsd.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Telecom Tower Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/towers', towerRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/power-systems', powerSystemRoutes);
app.use('/api/batteries', batteryRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/outages', outageRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  console.log('🚀 Starting Telecom Tower Management System...');
  console.log('📦 Loading environment variables...');

  // Connect to MongoDB FIRST — server only starts if DB connects
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/register`);
    console.log(`   GET  /api/towers`);
    console.log(`   GET  /api/dashboard/stats`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
