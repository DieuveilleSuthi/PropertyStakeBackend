const jwt = require('jsonwebtoken');
const Agent = require('../models/agentsModel');

// Vérifie si le token est valide et si l'utilisateur est un agent
exports.protectAgent = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Récupérer le token Bearer

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const agent = await Agent.findById(decoded.id);

      if (!agent) {
        return res.status(403).json({ message: 'Access denied: User is not an agent' });
      }

      req.agent = agent; // Ajoute l'agent à la requête
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Authorization token not provided' });
  }
};
