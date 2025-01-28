const express = require('express');
const router = express.Router();
const {
  createProperty,
  updateProperty,
  deleteProperty,
  getAllPropertiesForAgent,
  getOpenProperties,
  getPropertyById,
} = require('../controllers/propertyController');
const { protectAgent } = require('../middleware/authMiddleware');

// Routes réservées aux agents
router.post('/createProperty', protectAgent, createProperty);
router.get('/getAllPropertiesForAgent', protectAgent, getAllPropertiesForAgent);
router.put('/updateProperty/:id', protectAgent, updateProperty);
router.delete('/deleteProperty/:id', protectAgent, deleteProperty);

// Routes publiques
router.get('/getOpenProperties', getOpenProperties);
router.get('/getPropertyById/:id', getPropertyById);

module.exports = router;
