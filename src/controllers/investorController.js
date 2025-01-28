const Investor = require('../models/investorsModel');
const jwt = require('jsonwebtoken');

// Créer un nouvel investisseur
const createInvestor = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const newInvestor = new Investor({ name, email, password });

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await Investor.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }
        const savedInvestor = await newInvestor.save();

        // Générer un token
        const token = jwt.sign({ id: savedInvestor._id, role: 'investor' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({savedInvestor, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Obtenir tous les investisseurs
const getAllInvestors = async (req, res) => {
    try {
        const investors = await Investor.find();
        res.status(200).json(investors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Ajouter des fonds au wallet
const rechargeWallet = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    try {
        const investor = await Investor.findById(id);
        if (!investor) return res.status(404).json({ message: 'Investor not found' });

        investor.wallet.balance += amount;
        investor.wallet.transactions.push({ type: 'recharge', amount });
        await investor.save();

        res.status(200).json(investor.wallet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { createInvestor, getAllInvestors, rechargeWallet };
