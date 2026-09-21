import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { runSeed } from './seed';

// Routes
import authRoutes from '../routes/authRoutes';
import towerRoutes from '../routes/towerRoutes';
import assetRoutes from '../routes/assetRoutes';
import powerSystemRoutes from '../routes/powerSystemRoutes';
import batteryRoutes from '../routes/batteryRoutes';
import inspectionRoutes from '../routes/inspectionRoutes';
import maintenanceRoutes from '../routes/maintenanceRoutes';
import outageRoutes from '../routes/outageRoutes';
import alertRoutes from '../routes/alertRoutes';
import technicianRoutes from '../routes/technicianRoutes';
import dashboardRoutes from '../routes/dashboardRoutes';

dotenv.config();

const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'OK' });
  });

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

  return app;
};

const runTests = async () => {
  console.log('\n🧪 Starting Telecom Tower System API Integration Test Suite...\n');

  // 1. Setup Mongo Memory Server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log('✅ In-memory MongoDB connected for testing');

  // 2. Seed Data
  await runSeed();
  console.log('✅ Seed data initialized');

  // 3. Start Test Express Server
  const app = createTestApp();
  const TEST_PORT = 5099;
  const server = app.listen(TEST_PORT);
  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  let passedCount = 0;
  let failedCount = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    Error: ${err.message || err}`);
      failedCount++;
    }
  };

  let adminToken = '';
  let operatorToken = '';
  let createdTowerId = '';
  let createdAssetId = '';
  let createdOutageId = '';
  let createdMaintenanceId = '';

  try {
    console.log('\n--- 1. HEALTH CHECK & AUTHENTICATION TESTS ---');
    await test('GET /api/health should return 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error('Expected success: true');
    });

    await test('POST /api/auth/login (Admin Login) should return token & user data', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@telecom.com', password: 'Admin@1234' }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      adminToken = data.token;
    });

    await test('POST /api/auth/login (Operator Login) should return token', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'operator@telecom.com', password: 'Operator@1234' }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      operatorToken = data.token;
    });

    await test('GET /api/auth/me should return current authenticated user', async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.data.email !== 'admin@telecom.com') throw new Error('Mismatch user email');
    });

    await test('POST /api/auth/register should create a new user', async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Engineer',
          email: 'engineer.test@telecom.com',
          password: 'Test@Password123',
          role: 'TECHNICIAN',
        }),
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
    });

    console.log('\n--- 2. TOWER MANAGEMENT TESTS ---');
    await test('GET /api/towers should return list of seeded towers', async () => {
      const res = await fetch(`${BASE_URL}/towers`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('No towers returned');
    });

    await test('POST /api/towers should create a new tower', async () => {
      const res = await fetch(`${BASE_URL}/towers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          towerId: 'TWR-TEST-99',
          name: 'Test Connectivity Hub',
          location: {
            address: 'Electronic City Phase 1',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.8399,
            longitude: 77.677,
          },
          towerType: 'MONOPOLE',
          operator: 'TelecomCo India',
          installationDate: '2024-01-15',
          height: 48,
          status: 'ACTIVE',
        }),
      });
      if (res.status !== 201) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      const data = await res.json();
      createdTowerId = data.data._id;
    });

    await test('GET /api/towers/:id should fetch single tower details', async () => {
      const res = await fetch(`${BASE_URL}/towers/${createdTowerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.data.towerId !== 'TWR-TEST-99') throw new Error('Tower ID mismatch');
    });

    await test('PUT /api/towers/:id should update tower details', async () => {
      const res = await fetch(`${BASE_URL}/towers/${createdTowerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'MAINTENANCE' }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.data.status !== 'MAINTENANCE') throw new Error('Status failed to update');
    });

    console.log('\n--- 3. ASSET MANAGEMENT TESTS ---');
    await test('GET /api/assets should return asset inventory', async () => {
      const res = await fetch(`${BASE_URL}/assets`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Expected array of assets');
    });

    await test('POST /api/assets should create asset attached to created tower', async () => {
      const res = await fetch(`${BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          assetId: 'AST-TEST-101',
          towerId: createdTowerId,
          assetType: 'ROUTER',
          manufacturer: 'Cisco',
          model: 'ASR-9000',
          serialNumber: 'CSC-TEST-SN-99',
          installationDate: '2024-01-20',
          status: 'OPERATIONAL',
        }),
      });
      if (res.status !== 201) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      const data = await res.json();
      createdAssetId = data.data._id;
    });

    console.log('\n--- 4. BATTERIES & POWER SYSTEMS TESTS ---');
    await test('GET /api/batteries should return battery systems list', async () => {
      const res = await fetch(`${BASE_URL}/batteries`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('No batteries returned');
    });

    await test('GET /api/power-systems should return power systems list', async () => {
      const res = await fetch(`${BASE_URL}/power-systems`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('No power systems returned');
    });

    console.log('\n--- 5. TECHNICIANS MANAGEMENT TESTS ---');
    await test('GET /api/technicians should return technician roster', async () => {
      const res = await fetch(`${BASE_URL}/technicians`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('No technicians returned');
    });

    console.log('\n--- 6. MAINTENANCE & INSPECTION TESTS ---');
    await test('GET /api/maintenance should return maintenance logs', async () => {
      const res = await fetch(`${BASE_URL}/maintenance`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Expected array');
    });

    await test('POST /api/maintenance should schedule a new maintenance ticket', async () => {
      const res = await fetch(`${BASE_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          maintenanceId: 'MNT-TEST-55',
          towerId: createdTowerId,
          maintenanceType: 'PREVENTIVE',
          scheduledDate: new Date().toISOString(),
          priority: 'HIGH',
          description: 'Routine battery and antenna alignment check',
        }),
      });
      if (res.status !== 201) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      const data = await res.json();
      createdMaintenanceId = data.data._id;
    });

    console.log('\n--- 7. OUTAGE & ALERT MANAGEMENT TESTS ---');
    await test('GET /api/outages should return outage list', async () => {
      const res = await fetch(`${BASE_URL}/outages`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('POST /api/outages should report a new outage event', async () => {
      const res = await fetch(`${BASE_URL}/outages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          outageId: 'OUT-TEST-88',
          towerId: createdTowerId,
          severity: 'HIGH',
          cause: 'Grid power disruption test',
          affectedServices: ['4G LTE'],
        }),
      });
      if (res.status !== 201) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      const data = await res.json();
      createdOutageId = data.data._id;
    });

    await test('PUT /api/outages/:id should resolve an outage', async () => {
      const res = await fetch(`${BASE_URL}/outages/${createdOutageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'RESOLVED',
          endTime: new Date().toISOString(),
          resolutionDetails: 'Main power line restored successfully.',
        }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('GET /api/alerts should return active alerts list', async () => {
      const res = await fetch(`${BASE_URL}/alerts`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Expected array');
    });

    console.log('\n--- 8. DASHBOARD & ANALYTICS TESTS ---');
    await test('GET /api/dashboard/stats should return system overview metrics', async () => {
      const res = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.data || typeof data.data.kpis?.totalTowers !== 'number') throw new Error('Invalid dashboard stats payload');
    });

    console.log('\n--- 9. CLEANUP TESTS ---');
    await test('DELETE /api/assets/:id should remove test asset', async () => {
      const res = await fetch(`${BASE_URL}/assets/${createdAssetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('DELETE /api/towers/:id should remove test tower', async () => {
      const res = await fetch(`${BASE_URL}/towers/${createdTowerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

  } finally {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  }

  console.log('\n==================================================');
  console.log(`📊 API TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
