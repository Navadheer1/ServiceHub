import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  role: { type: String, default: 'user' }, // Just to be safe
  favoriteAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
  
  // New Profile Fields
  profilePhoto: { type: String }, // URL
  language: { type: String, default: 'English' },
  status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date },
  profileCompletion: { type: Number, default: 0 },
  
  // User Specific
  savedAddresses: [{
    label: String, // Home, Work
    address: String,
    coordinates: { type: [Number] }
  }],
  preferredServices: [{ type: String }],
  paymentMethods: [{
    type: { type: String }, // Card, UPI
    maskedNumber: String,
    isDefault: Boolean
  }],
  privacy: {
    showPhone: { type: Boolean, default: false },
    allowChat: { type: Boolean, default: true }
  },
  
  profileUpdates: [{
    updatedAt: { type: Date, default: Date.now },
    fields: [String],
    ip: String
  }]
}, { timestamps: true });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
