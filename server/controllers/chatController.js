import ChatRoom from '../models/ChatRoom.js';
import ChatMessage from '../models/ChatMessage.js';
import ServiceRequest from '../models/ServiceRequest.js';

// @desc    Get or Create Chat Room for a Booking
// @route   GET /api/chat/room/:bookingId
// @access  Private (User/Agent)
const getChatRoom = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Check if booking exists
    const booking = await ServiceRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify Access
    const isUser = req.user.role === 'user' && booking.user.toString() === req.user._id.toString();
    const isAgent = ['agent', 'electrician', 'mechanic'].includes(req.user.role) && booking.agent.toString() === req.user._id.toString();

    if (!isUser && !isAgent) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // Check if room exists
    let chatRoom = await ChatRoom.findOne({ bookingId });

    if (!chatRoom) {
      // Create new room if booking is accepted/active
      if (['Accepted', 'OnTheWay', 'InProgress'].includes(booking.status)) {
        chatRoom = await ChatRoom.create({
          bookingId,
          userId: booking.user,
          agentId: booking.agent,
          chatStatus: 'ACTIVE'
        });
      } else {
        return res.status(400).json({ message: 'Chat cannot be created for this booking status' });
      }
    }

    // Check if we should close the chat based on job status
    if (booking.status === 'Completed' && chatRoom.chatStatus === 'ACTIVE') {
         // Auto-close if not already closed (though lifecycle usually closes it on completion event)
         chatRoom.chatStatus = 'CLOSED';
         chatRoom.closedAt = new Date();
         await chatRoom.save();
    }

    res.json(chatRoom);
  } catch (error) {
    console.error('Get Chat Room Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Chat Messages
// @route   GET /api/chat/messages/:chatRoomId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await ChatMessage.find({ chatRoomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Message
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, message } = req.body;
    
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' });
    }

    if (chatRoom.chatStatus === 'CLOSED') {
        return res.status(400).json({ message: 'Chat is closed' });
    }

    // Verify sender belongs to room
    const isUser = req.user.role === 'user' && chatRoom.userId.toString() === req.user._id.toString();
    const isAgent = ['agent', 'electrician', 'mechanic'].includes(req.user.role) && chatRoom.agentId.toString() === req.user._id.toString();

    if (!isUser && !isAgent) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // PHASE 2 — FIX BACKEND MESSAGE CREATION (REQUIRED)
    // Explicitly derive sender details from authenticated user
    const senderId = req.user._id;
    const senderRole = req.user.role; // Explicitly capture role from req.user
    const senderType = senderRole === 'user' ? 'USER' : 'AGENT'; // Keep for schema compatibility if needed

    const newMessage = await ChatMessage.create({
        chatRoomId,
        senderId,
        senderType, // Keeping this as per schema
        message
    });

    // PHASE 3 — FIX SOCKET / API EMIT
    // Ensure correct identity is emitted
    const io = req.app.get('io');
    const emittedMessage = {
      _id: newMessage._id,
      chatRoomId: newMessage.chatRoomId,
      text: newMessage.message,      
      message: newMessage.message,
      senderId: newMessage.senderId,
      senderType: newMessage.senderType,
      senderRole: senderRole,     // Explicitly send the captured role
      createdAt: newMessage.timestamp
    };
    
    io.to(chatRoomId.toString()).emit('receive_message', emittedMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export { getChatRoom, getMessages, sendMessage };
