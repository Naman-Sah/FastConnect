const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
   // middleware/authMiddleware.js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: decoded.id, _id: decoded.id }; // both available
next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
