const express = require('express');
const router = express.Router();
const { createAgent, getAllAgents, loginUser } = require('../controllers/agentController');

// Créer un agent
router.post('/', createAgent);

//login
router.post('/login', loginUser);

// Obtenir tous les agents
router.get('/getAllAgentsUser', getAllAgents);

module.exports = router;
