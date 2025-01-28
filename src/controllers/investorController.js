const Investor = require('../models/investorsModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

const getInvestorPortfolio = async (req, res) => {
    try {
      // Vérifie si la requête provient d'un investisseur
      const investor = await Investor.findById(req.params.investorId).populate('propertiesOwned.propertyId');
  
      if (!investor) {
        return res.status(404).json({ message: 'Investor not found' });
      }
  
      // Renvoie le portefeuille de l'investisseur
      res.status(200).json(investor.propertiesOwned);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
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
        const user = await Investor.findOne({ email });
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
             { id: user._id, role: user.role },
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
  

module.exports = { createInvestor, getAllInvestors, rechargeWallet, getInvestorPortfolio, loginUser };
