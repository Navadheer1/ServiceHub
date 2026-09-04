import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, enum: ['Electrician', 'Mechanic'], default: 'Electrician' },
  serviceType: { type: String, enum: ['Electrician', 'Mechanic'], required: true, default: 'Electrician' }, // Primary role definition
  role: { type: String, enum: ['agent', 'electrician', 'mechanic'], default: 'agent' }, // Migrating to explicit roles
  experience: { type: Number, default: 0 },
  skills: [{ type: String }], // e.g., ['Mobile', 'Laptop']
  
  // Profile & Status
  profilePhoto: { type: String },
  language: { type: String, default: 'English' },
  status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date },
  profileCompletion: { type: Number, default: 0 },
  
  // Service Details
  isAvailable: { type: Boolean, default: false }, // General availability toggle
  isEmergencyAvailable: { type: Boolean, default: false }, // Emergency capability flag
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    days: [{ type: String }] // Mon, Tue...
  },
  serviceRadius: { type: Number, default: 10 }, // km
  serviceCharge: {
    base: { type: Number, default: 0 },
    hourly: { type: Number, default: 0 }
  },
  tools: [{ type: String }],
  
  // Verification
  idProof: { type: String }, // URL to image
  certifications: [{ 
    title: String,
    url: String,
    expiryDate: Date
  }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },

  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  earnings: { type: Number, default: 0 },
  jobsCompleted: { type: Number, default: 0 },
  
  rating: { type: Number, default: 0 },
  reliability: {
    onTimePercentage: { type: Number, default: 100 },
    jobCompletionPercentage: { type: Number, default: 100 },
    cancellationRate: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  
  privacy: {
    showPhone: { type: Boolean, default: true },
    allowChat: { type: Boolean, default: true }
  },
  
  profileUpdates: [{
    updatedAt: { type: Date, default: Date.now },
    fields: [String],
    ip: String
  }]
}, { timestamps: true });

agentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

agentSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
