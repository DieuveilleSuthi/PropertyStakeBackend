const express = require('express');
const router = express.Router();
const { createInvestor, getAllInvestors, rechargeWallet, getInvestorPortfolio, loginUser } = require('../controllers/investorController');

// Créer un investisseur
router.post('/', createInvestor);

//login
router.post('/login', loginUser);

// Obtenir tous les investisseurs
router.get('/getAllInvestorsUser', getAllInvestors);

// Recharger le wallet d'un investisseur
router.post('/:id/wallet/recharge', rechargeWallet);

// Consulter le portefeuille d'un investisseur
router.get('/:investorId/portfolio', getInvestorPortfolio);

module.exports = router;
