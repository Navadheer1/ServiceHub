import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agent from '../models/Agent.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const migrateAgents = async () => {
  await connectDB();

  try {
    const agents = await Agent.find({});
    console.log(`Found ${agents.length} agents. Starting migration...`);

    let migratedCount = 0;

    for (const agent of agents) {
      let updated = false;
      const oldRole = agent.role;
      const oldServiceType = agent.serviceType;
      const oldEmergency = agent.isEmergencyAvailable;

      // 1. Normalize Service Type & Role from Specialization
      if (agent.specialization) {
          const specLower = agent.specialization.toLowerCase();
          
          if (specLower.includes('mechanic')) {
              if (agent.serviceType !== 'Mechanic') {
                  agent.serviceType = 'Mechanic';
                  updated = true;
              }
              if (agent.role !== 'mechanic') {
                  agent.role = 'mechanic';
                  updated = true;
              }
          } else if (specLower.includes('electrician')) {
              if (agent.serviceType !== 'Electrician') {
                  agent.serviceType = 'Electrician';
                  updated = true;
              }
              if (agent.role !== 'electrician') {
                  agent.role = 'electrician';
                  updated = true;
              }
          }

          // 2. Detect Emergency Capability
          if (specLower.includes('emergency')) {
              if (!agent.isEmergencyAvailable) {
                  agent.isEmergencyAvailable = true;
                  updated = true;
              }
          }
      }

      // 3. Ensure role matches serviceType (Enforce consistency)
      if (agent.serviceType === 'Mechanic' && agent.role !== 'mechanic') {
          agent.role = 'mechanic';
          updated = true;
      }
      if (agent.serviceType === 'Electrician' && agent.role !== 'electrician') {
          agent.role = 'electrician';
          updated = true;
      }

      // 4. Default Emergency to false if undefined
      if (agent.isEmergencyAvailable === undefined) {
          agent.isEmergencyAvailable = false;
          updated = true;
      }

      if (updated) {
          await agent.save();
          console.log(`Migrated [${agent.email}]:`);
          console.log(`   Role: ${oldRole} -> ${agent.role}`);
          console.log(`   Type: ${oldServiceType} -> ${agent.serviceType}`);
          console.log(`   Emergency: ${oldEmergency} -> ${agent.isEmergencyAvailable}`);
          migratedCount++;
      }
    }

    console.log(`Migration completed. Updated ${migratedCount} agents.`);
    process.exit();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateAgents();
