import ServiceRequest from '../models/ServiceRequest.js';
import Agent from '../models/Agent.js';
// import { io } from '../index.js'; // Removed to avoid circular dependency

// @desc    Create a new service request
// @route   POST /api/requests
// @access  Private (User)
const createRequest = async (req, res) => {
  try {
    const {
      category,
      description,
      serviceType,
      location,
      address,
      scheduledTime,
      media,
      bookingMode,
      vehicleDetails,
      agentType,
      isEmergency
    } = req.body;

    // Simple pricing logic
    let pricing = {
        minEstimate: 100, // Base charge
        maxEstimate: 500,
        laborCharge: 0,
        partsCharge: 0,
        emergencySurcharge: 0,
        finalAmount: 0
    };

    if (bookingMode === 'Emergency' || isEmergency) {
        pricing.emergencySurcharge = 300;
        pricing.minEstimate += 300;
        pricing.maxEstimate += 300;
    }

    const request = new ServiceRequest({
      user: req.user._id,
      category,
      description,
      serviceType,
      location, // Ensure this is { type: 'Point', coordinates: [long, lat] }
      address,
      scheduledTime,
      media,
      bookingMode: bookingMode || (isEmergency ? 'Emergency' : 'Scheduled'),
      isEmergency: isEmergency || bookingMode === 'Emergency',
      agentType: agentType || (category === 'Mechanic' ? 'Mechanic' : 'Electrician'),
      vehicleDetails,
      pricing
    });

    const createdRequest = await request.save();

    // Emit event to nearby agents (broadcasting to all 'agents' room for simplicity now)
    const io = req.app.get('io');
    if (io) {
        io.to('agents').emit('new_request', createdRequest);
    }

    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all requests (for Agent, filtered by location/status)
// @route   GET /api/requests/feed
// @access  Private (Agent)
const getRequestFeed = async (req, res) => {
  // Logic to find nearby pending requests
  try {
    let filter = { status: 'Pending' };
    
    // Filter based on agent specialization
    if (req.user.specialization === 'Mechanic') {
        filter.category = { $in: ['Mechanic', 'Roadside', 'Car', 'Bike'] };
    } else {
        // Electrician or others see non-mechanic jobs
        filter.category = { $nin: ['Mechanic', 'Roadside', 'Car', 'Bike'] };
    }

    const requests = await ServiceRequest.find(filter)
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's requests
// @route   GET /api/requests/my
// @access  Private (User)
const getUserRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user._id })
      .populate('agent', 'name phone rating reliability specialization')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent's jobs
// @route   GET /api/requests/agent/jobs
// @access  Private (Agent)
const getAgentJobs = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ agent: req.user._id })
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a request
// @route   PUT /api/requests/:id/accept
// @access  Private (Agent)
const acceptRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request already accepted' });
    }

    request.agent = req.user._id;
    request.status = 'Accepted';
    await request.save();

    // Notify user
    const io = req.app.get('io');
    if (io) {
      io.to(request.user.toString()).emit('request_status', { 
        requestId: request._id, 
        status: 'Accepted', 
        agent: req.user 
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private (Agent)
const updateStatus = async (req, res) => {
  try {
    const { status, pricing, warranty, completionDetails } = req.body; // 'OnTheWay', 'InProgress', 'Completed'
    console.log('UpdateStatus called with:', { id: req.params.id, status, pricing, completionDetails });

    const request = await ServiceRequest.findById(req.params.id);
    console.log('Request found:', request ? request._id : 'Not found');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!request.agent) {
      return res.status(400).json({ message: 'Request has no assigned agent' });
    }

    // Convert ObjectIds to strings for comparison
    const requestAgentId = request.agent.toString();
    const userAgentId = req.user._id.toString();
    
    console.log('Auth check:', { requestAgentId, userAgentId });

    if (requestAgentId !== userAgentId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;

    if (status === 'Completed') {
      if (pricing) {
        // Safe way to get existing pricing
        let existingPricing = {};
        if (request.pricing) {
            // Check if it has toObject (it should if it's a mongoose object)
            existingPricing = (typeof request.pricing.toObject === 'function') 
                ? request.pricing.toObject() 
                : JSON.parse(JSON.stringify(request.pricing));
        }

        const labor = Number(pricing.laborCharge) || 0;
        const parts = Number(pricing.partsCharge) || 0;
        const emergency = Number(existingPricing.emergencySurcharge) || 0;

        console.log('Calculating pricing:', { labor, parts, emergency, existingPricing });

        request.pricing = { 
          ...existingPricing, 
          ...pricing,
          laborCharge: labor,
          partsCharge: parts,
          finalAmount: labor + parts + emergency
        };
      }

      if (warranty) {
        request.warranty = warranty;
      }

      if (completionDetails) {
        // Handle notes separately if it's not in completionDetails schema
        if (completionDetails.notes) {
            request.notes = completionDetails.notes;
            // Remove notes from completionDetails to avoid schema issues if strict
            const { notes, ...rest } = completionDetails;
            request.completionDetails = { ...request.completionDetails, ...rest };
        } else {
            request.completionDetails = completionDetails;
        }
      }
      
      // Auto-expire chat logic
      const ChatRoom = (await import('../models/ChatRoom.js')).default;
      const chatRoom = await ChatRoom.findOne({ bookingId: request._id });
      if (chatRoom) {
          chatRoom.chatStatus = 'CLOSED';
          chatRoom.closedAt = new Date();
          await chatRoom.save();
          console.log(`Chat room ${chatRoom._id} closed due to job completion`);
      }
    }

    await request.save();
    console.log('Request saved successfully');

    // Notify user with socket event including pricing for instant bill sync
    const io = req.app.get('io');
    if (io) {
      io.to(request.user.toString()).emit('request_status', { 
        requestId: request._id, 
        status,
        agent: req.user,
        pricing: request.pricing,
        warranty: request.warranty,
        invoiceReady: status === 'Completed'
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Invoice
// @route   POST /api/requests/:id/invoice
// @access  Private (Agent)
const generateInvoice = async (req, res) => {
  try {
    const { laborCharge, partsCharge, warrantyDays, notes } = req.body;
    
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Auth check
    if (request.agent.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const labor = Number(laborCharge) || 0;
    const parts = Number(partsCharge) || 0;
    const emergency = Number(request.pricing?.emergencySurcharge) || 0;
    const total = labor + parts + emergency;

    // Update pricing
    request.pricing = {
      ...request.pricing?.toObject(),
      laborCharge: labor,
      partsCharge: parts,
      finalAmount: total
    };

    // Update warranty
    if (warrantyDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(warrantyDays));
      request.warranty = {
        periodDays: Number(warrantyDays),
        expiryDate
      };
    }

    // Update notes
    if (notes) request.notes = notes;

    // Set Invoice Status
    request.invoiceStatus = 'GENERATED';
    request.paymentStatus = 'PENDING';
    
    // Ensure job is NOT completed yet
    if (request.status === 'Completed') {
        request.status = 'InProgress'; // Revert if accidentally completed
    }

    await request.save();

    // Notify User
    const io = req.app.get('io');
    if (io) {
      io.to(request.user.toString()).emit('invoice_generated', {
        requestId: request._id,
        invoice: {
          pricing: request.pricing,
          warranty: request.warranty,
          notes: request.notes,
          invoiceStatus: 'GENERATED',
          paymentStatus: 'PENDING'
        }
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Generate Invoice Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm Payment (Cash/Online)
// @route   POST /api/requests/:id/payment
// @access  Private (Agent/User - depending on mode)
const confirmPayment = async (req, res) => {
  try {
    const { paymentMode } = req.body; // 'CASH' or 'ONLINE'
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // If Cash, only Agent can confirm
    if (paymentMode === 'CASH') {
        const isAgent = ['agent', 'electrician', 'mechanic'].includes(req.user.role);
        if (!isAgent || request.agent.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only assigned agent can confirm cash payment' });
        }
    }

    // If Online, User initiates (but usually this is a webhook from PG, simulating for now)
    // For now, assuming this endpoint is called after successful PG transaction
    if (paymentMode === 'ONLINE') {
        // In a real app, you'd verify signature/webhook
    }

    // Only update earnings if not already paid
    if (request.paymentStatus !== 'PAID') {
        // Update Agent Earnings
        try {
            const agent = await Agent.findById(request.agent);
            if (agent) {
                agent.earnings = (agent.earnings || 0) + (request.pricing.finalAmount || 0);
                await agent.save();
                console.log(`Agent ${agent._id} earnings updated: +${request.pricing.finalAmount}`);
            }
        } catch (err) {
            console.error('Error updating agent earnings:', err);
        }
    }

    request.paymentStatus = 'PAID';
    request.paymentMode = paymentMode;
    request.invoiceStatus = 'PAID';
    request.status = 'Completed';

    await request.save();

    // Notify both parties
    const eventData = {
        requestId: request._id,
        status: 'Completed',
        paymentStatus: 'PAID',
        paymentMode
    };

    const io = req.app.get('io');
    if (io) {
      io.to(request.user.toString()).emit('payment_completed', eventData);
      io.to(request.agent.toString()).emit('payment_completed', eventData); // Notify agent too if they are listening
    }

    res.json(request);
  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Select Payment Mode (User)
// @route   POST /api/requests/:id/payment-mode
// @access  Private (User)
const selectPaymentMode = async (req, res) => {
  try {
    const { paymentMode } = req.body; // 'CASH' or 'ONLINE'
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.paymentMode = paymentMode;
    await request.save();

    // Notify Agent
    const io = req.app.get('io');
    if (io) {
      io.to(request.agent.toString()).emit('payment_mode_selected', {
        requestId: request._id,
        paymentMode
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Select Payment Mode Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export { 
    createRequest, 
    getRequestFeed, 
    getUserRequests, 
    getAgentJobs, 
    acceptRequest, 
    updateStatus, 
    generateInvoice, 
    confirmPayment,
    selectPaymentMode
};
