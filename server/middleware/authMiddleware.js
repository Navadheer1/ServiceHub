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

      if (decoded.role === 'user') {
        req.user = await User.findById(decoded.id).select('-password');
      } else if (decoded.role === 'agent') {
        req.user = await Agent.findById(decoded.id).select('-password');
      }

      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user/agent not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const agentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'agent') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an agent' });
  }
};

export { protect, agentOnly };
