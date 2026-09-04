import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Agent from '../models/Agent.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Decoded:', decoded);

      if (decoded.role === 'user') {
        req.user = await User.findById(decoded.id).select('-password');
        if (req.user) req.user.role = 'user'; // Explicitly set role
      } else if (['agent', 'electrician', 'mechanic'].includes(decoded.role)) {
        req.user = await Agent.findById(decoded.id).select('-password');
        if (req.user) {
          // If the DB object has a role, use it; otherwise, use the one from the token
          req.user.role = req.user.role || decoded.role;
        }
      }

      if (!req.user) {
         console.log('Auth Middleware - User/Agent not found for ID:', decoded.id);
         return res.status(401).json({ message: 'Not authorized, user/agent not found' });
      }

      console.log('Auth Middleware - Authorized User:', req.user._id, req.user.role);
      next();
    } catch (error) {
      console.error('Auth Middleware - Token Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('Auth Middleware - No Token Provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const agentOnly = (req, res, next) => {
  if (req.user && ['agent', 'electrician', 'mechanic'].includes(req.user.role)) {
    next();
  } else {
    console.log('Auth Middleware - AgentOnly Failed. User Role:', req.user ? req.user.role : 'No User');
    res.status(401).json({ message: 'Not authorized as an agent' });
  }
};

export { protect, agentOnly };
