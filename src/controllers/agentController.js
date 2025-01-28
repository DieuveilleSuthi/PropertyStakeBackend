const Agent = require('../models/agentsModel');
const jwt = require('jsonwebtoken');

// Créer un nouvel agent
const createAgent = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const newAgent = new Agent({ name, email, password });

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await Agent.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const savedAgent = await newAgent.save();

        // Générer un token
        const token = jwt.sign({ id: savedAgent._id, role: 'agent' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({savedAgent, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Obtenir tous les agents
const getAllAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        res.status(200).json(agents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createAgent, getAllAgents };
