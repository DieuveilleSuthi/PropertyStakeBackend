const express = require('express');
const router = express.Router();
const { createInvestor, getAllInvestors, rechargeWallet } = require('../controllers/investorController');

// Créer un investisseur
router.post('/', createInvestor);

// Obtenir tous les investisseurs
router.get('/getAllInvestorsUser', getAllInvestors);

// Recharger le wallet d'un investisseur
router.post('/:id/wallet/recharge', rechargeWallet);

module.exports = router;
