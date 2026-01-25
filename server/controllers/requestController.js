import ServiceRequest from '../models/ServiceRequest.js';
import Agent from '../models/Agent.js';
import { io } from '../index.js';

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
      vehicleDetails
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

    if (bookingMode === 'Emergency') {
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
      bookingMode,
      vehicleDetails,
      pricing
    });

    const createdRequest = await request.save();

    // Emit event to nearby agents (broadcasting to all 'agents' room for simplicity now)
    // In production, you'd filter by location here or let agents filter
    io.to('agents').emit('new_request', createdRequest);

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
    io.to(request.user.toString()).emit('request_status', { 
      requestId: request._id, 
      status: 'Accepted', 
      agent: req.user 
    });

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
      
      try {
          const agent = await Agent.findById(req.user._id);
          if (agent) {
            const amount = request.pricing?.finalAmount || 0;
            console.log('Updating agent earnings:', { agentId: agent._id, current: agent.earnings, add: amount });
            agent.earnings = (agent.earnings || 0) + amount;
            await agent.save();
          } else {
              console.log('Agent not found for earnings update:', req.user._id);
          }
      } catch (agentError) {
          console.error('Error updating agent earnings:', agentError);
          // Don't block request update if agent update fails, or maybe we should?
          // For now log it.
      }
    }

    await request.save();
    console.log('Request saved successfully');

    // Notify user
    io.to(request.user.toString()).emit('request_status', { 
      requestId: request._id, 
      status,
      pricing: request.pricing,
      warranty: request.warranty
    });

    res.json(request);
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export { createRequest, getRequestFeed, getUserRequests, getAgentJobs, acceptRequest, updateStatus };
