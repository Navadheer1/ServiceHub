import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, enum: ['Electrician', 'Mechanic'], default: 'Electrician' },
  experience: { type: Number, default: 0 },
  skills: [{ type: String }], // e.g., ['Mobile', 'Laptop']
  isAvailable: { type: Boolean, default: false },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  role: { type: String, default: 'agent' },
  idProof: { type: String }, // URL to image
  earnings: { type: Number, default: 0 },
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
  }]
}, { timestamps: true });

agentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

agentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
