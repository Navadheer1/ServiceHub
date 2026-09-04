import mongoose from 'mongoose';

const chatRoomSchema = mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  chatStatus: {
    type: String,
    enum: ['ACTIVE', 'CLOSED'],
    default: 'ACTIVE'
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Automatically delete chat room 72 hours after it is closed
chatRoomSchema.index({ closedAt: 1 }, { expireAfterSeconds: 259200 });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;
