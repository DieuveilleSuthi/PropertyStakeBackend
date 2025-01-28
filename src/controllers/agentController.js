const Agent = require('../models/agentsModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

        res.status(201).json({ savedAgent, token });
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

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérification que les champs sont remplis
        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
        }

        // Recherche de l'utilisateur dans la base de données
        const user = await Agent.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérification du mot de passe
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

         //Génération d'un token JWT
         const token = jwt.sign(
             { id: user._id, role: 'agent' },
             process.env.JWT_SECRET,
             { expiresIn: '1d' }
         );

        // Réponse avec les informations de l'utilisateur et le token
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token,
          });
    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur.', error: error.message });
    }
};

module.exports = { createAgent, getAllAgents, loginUser };
