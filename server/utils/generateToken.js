import jwt from 'jsonwebtoken';

const generateToken = (id, role, serviceType) => {
  const payload = { id, role };
  if (serviceType) {
    payload.serviceType = serviceType;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
