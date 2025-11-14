const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT_SECRET not set on server' });

    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id, _id: decoded.id }; // keep backward compatibility
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
