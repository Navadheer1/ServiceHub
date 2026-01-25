import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }, // Assigned agent
  category: { type: String, required: true }, // Mobile, Laptop, Mechanic, etc.
  description: { type: String, required: true },
  media: [{ type: String }], // URLs for images/videos
  serviceType: { type: String, enum: ['Home', 'Pickup', 'Roadside'], default: 'Home' },
  bookingMode: { type: String, enum: ['Emergency', 'Scheduled'], default: 'Scheduled' },
  vehicleDetails: {
    type: { type: String }, // Bike, Car
    brand: { type: String },
    model: { type: String },
    fuelType: { type: String },
    issueDescription: { type: String }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  address: { type: String },
  scheduledTime: { type: Date },
  pricing: {
    minEstimate: { type: Number },
    maxEstimate: { type: Number },
    laborCharge: { type: Number },
    partsCharge: { type: Number },
    emergencySurcharge: { type: Number },
    finalAmount: { type: Number }
  },
  warranty: {
    periodDays: { type: Number, default: 0 },
    expiryDate: { type: Date }
  },
  completionDetails: {
    checklist: [{ item: String, completed: Boolean }],
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }]
  },
  cost: { type: Number },
  notes: { type: String },
}, { timestamps: true });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
