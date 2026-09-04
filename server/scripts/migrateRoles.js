import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agent from '../models/Agent.js';

dotenv.config();

const migrateAgents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const agents = await Agent.find({});
    console.log(`Found ${agents.length} agents to migrate.`);

    let updatedCount = 0;

    for (const agent of agents) {
      let needsUpdate = false;
      
      // 1. Migrate Specialization to ServiceType & Role
      // Check if specialization implies Mechanic
      const spec = agent.specialization || 'Electrician';
      const isMechanic = spec.toLowerCase().includes('mechanic');
      const isElectrician = !isMechanic; // Default to Electrician

      // Determine ServiceType
      const newServiceType = isMechanic ? 'Mechanic' : 'Electrician';
      
      if (agent.serviceType !== newServiceType) {
        agent.serviceType = newServiceType;
        needsUpdate = true;
      }

      // Determine Role
      const newRole = isMechanic ? 'mechanic' : 'electrician';
      
      if (agent.role !== newRole) {
        agent.role = newRole;
        needsUpdate = true;
      }

      // 2. Handle Emergency Capability
      // If specialization was explicitly "Emergency Mechanic", enable emergency availability
      if (spec.toLowerCase().includes('emergency')) {
        agent.isEmergencyAvailable = true;
        // Normalize specialization string if needed, or keep it for legacy reference
        // agent.specialization = 'Mechanic'; 
      }
      
      // Ensure isEmergencyAvailable is set (default false if undefined)
      if (agent.isEmergencyAvailable === undefined) {
          agent.isEmergencyAvailable = false;
          needsUpdate = true;
      }

      if (needsUpdate) {
        await agent.save();
        updatedCount++;
        console.log(`Migrated Agent: ${agent.name} (${agent._id}) -> ${newRole} / ${newServiceType}`);
      }
    }

    console.log(`Migration Completed. Updated ${updatedCount} agents.`);
    process.exit();
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
};

migrateAgents();
