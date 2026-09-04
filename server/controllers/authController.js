import User from '../models/User.js';
import Agent from '../models/Agent.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/user/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, address, location } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    location
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'user',
      phone: user.phone,
      address: user.address,
      location: user.location,
      token: generateToken(user._id, 'user'),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/user/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'user',
      token: generateToken(user._id, 'user'),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new agent
// @route   POST /api/auth/agent/register
// @access  Public
const registerAgent = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    skills, 
    location, 
    experience, 
    specialization, // Legacy frontend field, maps to serviceType
    serviceType,    // New field
    isEmergencyAvailable 
  } = req.body;

  const agentExists = await Agent.findOne({ email });

  if (agentExists) {
    return res.status(400).json({ message: 'Agent already exists' });
  }

  // Map specialization to serviceType if not provided
  const finalServiceType = serviceType || specialization || 'Electrician';
  
  // Determine role based on serviceType
  let role = 'agent'; // Default fallback
  if (finalServiceType === 'Electrician') role = 'electrician';
  if (finalServiceType === 'Mechanic') role = 'mechanic';

  const agent = await Agent.create({
    name,
    email,
    password,
    phone,
    skills,
    location,
    experience,
    specialization: finalServiceType, // Keep for backward compatibility
    serviceType: finalServiceType,
    role, // Explicit role: 'electrician' or 'mechanic'
    isEmergencyAvailable: isEmergencyAvailable || false
  });

  if (agent) {
    res.status(201).json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      serviceType: agent.serviceType,
      isEmergencyAvailable: agent.isEmergencyAvailable,
      token: generateToken(agent._id, agent.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid agent data' });
  }
};

// @desc    Auth agent & get token
// @route   POST /api/auth/agent/login
// @access  Public
const loginAgent = async (req, res) => {
  const { email, password } = req.body;

  const agent = await Agent.findOne({ email });

  if (agent && (await agent.matchPassword(password))) {
    // Ensure role is up to date in response if using old data
    const role = agent.role || 'agent';
    
    res.json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      role: role,
      serviceType: agent.serviceType || agent.specialization || 'Electrician',
      specialization: agent.specialization,
      isEmergencyAvailable: agent.isEmergencyAvailable,
      reliability: agent.reliability,
      earnings: agent.earnings,
      rating: agent.rating,
      token: generateToken(agent._id, role, agent.serviceType),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Toggle favorite agent
// @route   PUT /api/auth/favorites
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const { agentId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!Array.isArray(user.favoriteAgents)) {
      user.favoriteAgents = [];
    }
    
    if (user.favoriteAgents.includes(agentId)) {
      user.favoriteAgents = user.favoriteAgents.filter(id => id.toString() !== agentId);
    } else {
      user.favoriteAgents.push(agentId);
    }
    
    await user.save();
    res.json(user.favoriteAgents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get favorite agents details
// @route   GET /api/auth/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    // If user is an agent, they don't have favorites
    if (['agent', 'electrician', 'mechanic'].includes(req.user.role)) {
        return res.json([]);
    }

    const user = await User.findById(req.user._id).populate('favoriteAgents', 'name phone specialization rating reliability');
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Ensure favoriteAgents is initialized
    if (!user.favoriteAgents) {
        return res.json([]);
    }

    res.json(user.favoriteAgents);
  } catch (error) {
    console.error('Get Favorites Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser, registerAgent, loginAgent, toggleFavorite, getFavorites };
