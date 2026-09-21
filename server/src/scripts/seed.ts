import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Tower } from '../models/Tower';
import { Asset } from '../models/Asset';
import { Battery } from '../models/Battery';
import { PowerSystem } from '../models/PowerSystem';
import { Technician } from '../models/Technician';
import { Maintenance } from '../models/Maintenance';
import { Inspection } from '../models/Inspection';
import { Outage } from '../models/Outage';
import { Alert } from '../models/Alert';

dotenv.config();

export const runSeed = async () => {


  // ─── Check if already seeded ────────────────────────────────────────────────
  const existingTowers = await Tower.countDocuments();
  if (existingTowers > 0) {
    console.log(`⚠️  Database already has ${existingTowers} towers. Skipping seed to avoid duplicates.`);
    console.log('   To re-seed, manually clear the database first.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log('\n📡 Seeding Telecom Tower Management System data...\n');

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@telecom.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  }

  // ─── Operator & Technician Users ─────────────────────────────────────────────
  const operatorUser = await User.create({
    name: 'Raj Operator',
    email: 'operator@telecom.com',
    password: 'Operator@1234',
    role: 'OPERATOR',
  });

  const techUser1 = await User.create({
    name: 'Priya Technician',
    email: 'priya@telecom.com',
    password: 'Tech@1234',
    role: 'TECHNICIAN',
  });

  const techUser2 = await User.create({
    name: 'Arjun Kumar',
    email: 'arjun@telecom.com',
    password: 'Tech@1234',
    role: 'TECHNICIAN',
  });

  console.log('✅ Users seeded');

  // ─── Towers ─────────────────────────────────────────────────────────────────
  const towersData = [
    { towerId: 'TWR-001', name: 'Chennai Central Tower', location: { address: 'Anna Salai, Teynampet', city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0604, longitude: 80.2496 }, towerType: 'MONOPOLE', operator: 'TelecomCo India', installationDate: new Date('2020-03-15'), status: 'ACTIVE', height: 45 },
    { towerId: 'TWR-002', name: 'Mumbai Bandra Tower', location: { address: 'Linking Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0544, longitude: 72.8405 }, towerType: 'LATTICE', operator: 'TelecomCo India', installationDate: new Date('2019-07-22'), status: 'ACTIVE', height: 60 },
    { towerId: 'TWR-003', name: 'Bangalore Koramangala Tower', location: { address: '100 Feet Road, Koramangala', city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9352, longitude: 77.6245 }, towerType: 'MONOPOLE', operator: 'TelecomCo India', installationDate: new Date('2021-01-10'), status: 'MAINTENANCE', height: 40 },
    { towerId: 'TWR-004', name: 'Delhi Connaught Place Tower', location: { address: 'Connaught Place, Block A', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6315, longitude: 77.2167 }, towerType: 'ROOFTOP', operator: 'TelecomCo India', installationDate: new Date('2018-11-05'), status: 'CRITICAL', height: 35 },
    { towerId: 'TWR-005', name: 'Hyderabad HITEC City Tower', location: { address: 'HITEC City, Madhapur', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.4474, longitude: 78.3762 }, towerType: 'MONOPOLE', operator: 'TelecomCo India', installationDate: new Date('2022-05-18'), status: 'ACTIVE', height: 50 },
    { towerId: 'TWR-006', name: 'Pune Kothrud Tower', location: { address: 'Kothrud, Near Chandani Chowk', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5074, longitude: 73.8077 }, towerType: 'GUYED', operator: 'TelecomCo India', installationDate: new Date('2020-09-30'), status: 'OFFLINE', height: 55 },
    { towerId: 'TWR-007', name: 'Kolkata Salt Lake Tower', location: { address: 'Sector V, Salt Lake City', city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.4312 }, towerType: 'LATTICE', operator: 'TelecomCo India', installationDate: new Date('2021-08-14'), status: 'ACTIVE', height: 65 },
    { towerId: 'TWR-008', name: 'Ahmedabad Satellite Tower', location: { address: 'Satellite Road, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0300, longitude: 72.5100 }, towerType: 'MONOPOLE', operator: 'TelecomCo India', installationDate: new Date('2023-02-01'), status: 'ACTIVE', height: 42 },
  ];

  const towers = await Tower.insertMany(towersData);
  console.log(`✅ ${towers.length} towers seeded`);

  // ─── Technicians ─────────────────────────────────────────────────────────────
  const technician1 = await Technician.create({
    technicianId: 'TECH-001',
    userId: techUser1._id,
    name: 'Priya Technician',
    email: 'priya@telecom.com',
    phone: '+91-9876543210',
    specialization: ['Tower Maintenance', 'Power Systems', 'Antenna Installation'],
    assignedTowers: [towers[0]._id, towers[2]._id],
    status: 'ASSIGNED',
    certifications: ['Telecom Tower Safety', 'High Voltage Operations'],
    yearsOfExperience: 6,
  });

  const technician2 = await Technician.create({
    technicianId: 'TECH-002',
    userId: techUser2._id,
    name: 'Arjun Kumar',
    email: 'arjun@telecom.com',
    phone: '+91-9876543211',
    specialization: ['Battery Systems', 'Generator Maintenance'],
    assignedTowers: [towers[1]._id, towers[3]._id],
    status: 'AVAILABLE',
    certifications: ['Battery Safety', 'Generator Operations'],
    yearsOfExperience: 4,
  });

  console.log('✅ Technicians seeded');

  // ─── Assets ──────────────────────────────────────────────────────────────────
  const assetsData = towers.slice(0, 4).flatMap((tower, i) => [
    { assetId: `AST-${String(i * 3 + 1).padStart(3, '0')}`, towerId: tower._id, assetType: 'ANTENNA', manufacturer: 'Ericsson', model: `AIR-${6000 + i * 10}`, serialNumber: `ERI-SN-${10000 + i}`, installationDate: new Date('2021-01-01'), status: i === 3 ? 'FAULTY' : 'OPERATIONAL' },
    { assetId: `AST-${String(i * 3 + 2).padStart(3, '0')}`, towerId: tower._id, assetType: 'BASE_STATION', manufacturer: 'Nokia', model: `AirScale-${200 + i}`, serialNumber: `NOK-SN-${20000 + i}`, installationDate: new Date('2021-01-01'), status: 'OPERATIONAL' },
    { assetId: `AST-${String(i * 3 + 3).padStart(3, '0')}`, towerId: tower._id, assetType: 'GENERATOR', manufacturer: 'Cummins', model: `C${150 + i * 25}D5`, serialNumber: `CUM-SN-${30000 + i}`, installationDate: new Date('2020-06-15'), status: i === 2 ? 'MAINTENANCE' : 'OPERATIONAL' },
  ]);

  const assets = await Asset.insertMany(assetsData);
  console.log(`✅ ${assets.length} assets seeded`);

  // ─── Power Systems ───────────────────────────────────────────────────────────
  const powerData = towers.map((tower, i) => ({
    towerId: tower._id,
    mainPowerStatus: i === 5 ? 'OFFLINE' : i === 3 ? 'CRITICAL' : 'NORMAL',
    generatorStatus: i === 5 ? 'RUNNING' : 'STANDBY',
    voltage: 220 + Math.random() * 10 - 5,
    current: 15 + Math.random() * 5,
    powerConsumption: 3.2 + Math.random() * 1.5,
    generatorRuntime: i === 5 ? 72 : 0,
    status: i === 5 ? 'OFFLINE' : i === 3 ? 'CRITICAL' : 'NORMAL',
  }));

  await PowerSystem.insertMany(powerData);
  console.log('✅ Power systems seeded');

  // ─── Batteries ───────────────────────────────────────────────────────────────
  const batteryData = towers.map((tower, i) => ({
    batteryId: `BAT-${String(i + 1).padStart(3, '0')}`,
    towerId: tower._id,
    batteryType: 'VRLA',
    capacityAh: 100,
    currentChargePercent: i === 3 ? 15 : i === 5 ? 8 : 75 + Math.random() * 20,
    voltage: i === 3 ? 44 : 48 + Math.random() * 2,
    temperature: 25 + Math.random() * 10,
    healthPercent: i === 5 ? 62 : 85 + Math.random() * 10,
    backupDurationHours: i === 3 ? 1.5 : 8,
    status: i === 3 ? 'CRITICAL' : i === 5 ? 'WARNING' : 'HEALTHY',
    manufacturer: 'Exide',
    model: 'PowerSafe-100AH',
    installationDate: new Date('2021-06-01'),
  }));

  await Battery.insertMany(batteryData);
  console.log('✅ Batteries seeded');

  // ─── Inspections ─────────────────────────────────────────────────────────────
  const inspectionData = [
    { inspectionId: 'INSP-001', towerId: towers[0]._id, technicianId: technician1._id, inspectionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), structuralCondition: 'GOOD', equipmentCondition: 'EXCELLENT', powerCondition: 'GOOD', safetyCondition: 'GOOD', status: 'SCHEDULED' },
    { inspectionId: 'INSP-002', towerId: towers[2]._id, technicianId: technician1._id, inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), structuralCondition: 'FAIR', equipmentCondition: 'FAIR', powerCondition: 'GOOD', safetyCondition: 'GOOD', status: 'SCHEDULED' },
    { inspectionId: 'INSP-003', towerId: towers[1]._id, technicianId: technician2._id, inspectionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), structuralCondition: 'EXCELLENT', equipmentCondition: 'EXCELLENT', powerCondition: 'EXCELLENT', safetyCondition: 'EXCELLENT', status: 'COMPLETED', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), findings: 'All systems operational. Minor cable weathering observed.' },
    { inspectionId: 'INSP-004', towerId: towers[3]._id, technicianId: technician2._id, inspectionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), structuralCondition: 'POOR', equipmentCondition: 'CRITICAL', powerCondition: 'CRITICAL', safetyCondition: 'FAIR', status: 'IN_PROGRESS' },
  ];

  await Inspection.insertMany(inspectionData);
  console.log('✅ Inspections seeded');

  // ─── Maintenance ─────────────────────────────────────────────────────────────
  const maintenanceData = [
    { maintenanceId: 'MNT-001', towerId: towers[2]._id, technicianId: technician1._id, maintenanceType: 'CORRECTIVE', scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: 'HIGH', status: 'SCHEDULED', description: 'Repair generator fuel system — reported failure during last inspection.' },
    { maintenanceId: 'MNT-002', towerId: towers[3]._id, technicianId: technician2._id, maintenanceType: 'EMERGENCY', scheduledDate: new Date(), priority: 'CRITICAL', status: 'IN_PROGRESS', description: 'Emergency battery replacement — battery at 15% health critical threshold.' },
    { maintenanceId: 'MNT-003', towerId: towers[0]._id, technicianId: technician1._id, maintenanceType: 'PREVENTIVE', scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), priority: 'MEDIUM', status: 'SCHEDULED', description: 'Scheduled quarterly antenna alignment and cleaning.' },
    { maintenanceId: 'MNT-004', towerId: towers[1]._id, technicianId: technician2._id, maintenanceType: 'ROUTINE', scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), completionDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), priority: 'LOW', status: 'COMPLETED', description: 'Routine cable inspection and connector check.', resolution: 'All connectors cleaned and secured. No issues found.' },
  ];

  await Maintenance.insertMany(maintenanceData);
  console.log('✅ Maintenance records seeded');

  // ─── Outages ─────────────────────────────────────────────────────────────────
  const outageData = [
    { outageId: 'OUT-001', towerId: towers[5]._id, startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), severity: 'HIGH', status: 'ACTIVE', reportedBy: adminUser._id, cause: 'Main power grid failure — running on generator', affectedServices: ['4G LTE', '5G NR'] },
    { outageId: 'OUT-002', towerId: towers[3]._id, startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), severity: 'CRITICAL', status: 'INVESTIGATING', reportedBy: operatorUser._id, cause: 'Battery drain critical — power system fault', affectedServices: ['2G', '3G', '4G LTE'] },
    { outageId: 'OUT-003', towerId: towers[1]._id, startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endTime: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), durationMinutes: 180, severity: 'MEDIUM', status: 'RESOLVED', reportedBy: adminUser._id, cause: 'Planned maintenance downtime', resolutionDetails: 'Tower brought back online after successful maintenance.' },
  ];

  await Outage.insertMany(outageData);
  console.log('✅ Outages seeded');

  // ─── Alerts ──────────────────────────────────────────────────────────────────
  const alertData = [
    { alertId: 'ALT-001', type: 'TOWER_OFFLINE', towerId: towers[5]._id, severity: 'HIGH', message: 'TWR-006 Pune Kothrud Tower is OFFLINE — main power failure detected', status: 'ACTIVE' },
    { alertId: 'ALT-002', type: 'BATTERY_CRITICAL', towerId: towers[3]._id, severity: 'CRITICAL', message: 'TWR-004 Delhi Connaught Place Tower — Battery charge at 15%. Immediate replacement required.', status: 'ACTIVE' },
    { alertId: 'ALT-003', type: 'POWER_FAILURE', towerId: towers[3]._id, severity: 'CRITICAL', message: 'TWR-004 Power system in CRITICAL state — voltage below threshold', status: 'ACTIVE' },
    { alertId: 'ALT-004', type: 'MAINTENANCE_OVERDUE', towerId: towers[2]._id, severity: 'HIGH', message: 'TWR-003 Generator maintenance is overdue by 3 days', status: 'ACKNOWLEDGED' },
    { alertId: 'ALT-005', type: 'INSPECTION_OVERDUE', towerId: towers[4]._id, severity: 'MEDIUM', message: 'TWR-005 Site inspection scheduled for yesterday — not yet completed', status: 'ACTIVE' },
  ];

  await Alert.insertMany(alertData);
  console.log('✅ Alerts seeded');

  console.log('\n🎉 Database seeding complete!');
  console.log('─────────────────────────────────────');
  console.log(`📧 Admin Email:     ${adminEmail}`);
  console.log(`🔑 Admin Password:  ${adminPassword}`);
  console.log(`📧 Operator Email:  operator@telecom.com`);
  console.log(`🔑 Operator Pwd:    Operator@1234`);
  console.log(`📧 Technician 1:    priya@telecom.com`);
  console.log(`📧 Technician 2:    arjun@telecom.com`);
  console.log(`🔑 Technician Pwd:  Tech@1234`);
  console.log('─────────────────────────────────────');
  console.log(`🗼 Towers:          ${towers.length}`);
  console.log(`🔧 Assets:          ${assets.length}`);
  console.log(`⚡ Power Systems:   ${towers.length}`);
  console.log(`🔋 Batteries:       ${towers.length}`);
  console.log(`👷 Technicians:     2`);
  console.log(`🔍 Inspections:     4`);
  console.log(`🛠️  Maintenance:     4`);
  console.log(`⚠️  Outages:         3`);
  console.log(`🚨 Alerts:          5`);

  console.log('\n✅ Seed complete.');
};

if (require.main === module) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }
  console.log('🌱 Connecting to MongoDB for seeding...');
  mongoose.connect(uri)
    .then(() => runSeed())
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
