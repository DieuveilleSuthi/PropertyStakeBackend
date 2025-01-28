const express = require('express');
const router = express.Router();
const { createAgent, getAllAgents } = require('../controllers/agentController');

// Créer un agent
router.post('/', createAgent);

// Obtenir tous les agents
router.get('/getAllAgentsUser', getAllAgents);

module.exports = router;
