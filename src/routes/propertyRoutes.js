const express = require('express');
const router = express.Router();
const {
  createProperty,
  updateProperty,
  deleteProperty,
  getAllPropertiesForAgent,
  getOpenProperties,
  getPropertyById,
  protectInvestor,
  getInvestorPortfolio,
  investInProperty,
  refundInvestors,
  addRentalIncome
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

// Lister le portefeuille de l'investisseur
router.get('/investors/:id/portfolio', protectInvestor, getInvestorPortfolio);

// Investir dans une propriété
router.post('/:id/invest', protectInvestor, investInProperty);

// Rembourser les investisseurs si la propriété n'est pas entièrement financée dans les 2 mois
router.post('/:id/refund', protectAgent, refundInvestors);

// Ajouter le revenu locatif mensuel au portefeuille de l'investisseur
router.post('/:id/income', protectAgent, addRentalIncome);

module.exports = router;