const Property = require('../models/property');
const Agent = require('../models/agentsModel');
const Investor = require('../models/investorsModel');
const { sendReceiptEmail } = require('../utils/emailReceiptService');
const { sendFundedEmail } = require('../utils/emailFundedService');
const jwt = require('jsonwebtoken');

// Middleware pour protéger l'accès des agents
exports.protectAgent = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Récupérer le token Bearer

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const agent = await Agent.findById(decoded.id);

      if (!agent) {
        return res.status(403).json({ message: 'Access denied: User is not an agent' });
      }

      req.agent = agent; // Ajoute l'agent à la requête
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Authorization token not provided' });
  }
};

// Middleware pour protéger l'accès des investisseurs
exports.protectInvestor = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Récupérer le token Bearer

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const investor = await Investor.findById(decoded.id);

      if (!investor) {
        return res.status(403).json({ message: 'Access denied: User is not an investor' });
      }

      req.investor = investor; // Ajoute l'investisseur à la requête
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Authorization token not provided' });
  }
};

// Créer une nouvelle propriété
exports.createProperty = async (req, res) => {
  const { name, type, price, fundingDeadline, interestRate, status, totalFunded } = req.body;

  try {
    const property = new Property({
      name,
      type,
      price,
      fundingDeadline,
      interestRate,
      status,
      totalFunded
    });

    const savedProperty = await property.save();

    // Lier la propriété à l'agent connecté
    req.agent.managedProperties.push({ propertyId: savedProperty._id, name: savedProperty.name });
    await req.agent.save();

    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour une propriété
exports.updateProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status === 'open' || property.totalFunded > 0) {
      return res.status(400).json({ message: 'Cannot update a property that has started funding' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une propriété
exports.deleteProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status === 'open' || property.totalFunded > 0) {
      return res.status(400).json({ message: 'Cannot delete a property that has started funding' });
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir une propriété par ID
exports.getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lister toutes les propriétés pour un agent
exports.getAllPropertiesForAgent = async (req, res) => {
  try {
    // Vérifie si la requête provient d'un agent
    if (!req.agent) {
      return res.status(403).json({ message: 'Access denied: Only agents can access this route' });
    }

    const properties = await Property.find(); // Récupérer toutes les propriétés
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Lister les propriétés ouvertes au financement
exports.getOpenProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'open' }).limit(6); // Récupérer au maximum 6 propriétés ouvertes
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching open properties', error: error.message });
  }
};

// Lister le portefeuille de l'investisseur
exports.getInvestorPortfolio = async (req, res) => {
  const { id } = req.params;

  try {
    const investor = await Investor.findById(id);
    if (!investor) return res.status(404).json({ message: 'Investor not found' });

    // Récupérer les propriétés dans lesquelles l'investisseur a des parts
    const properties = await Property.find({ 'investors.investorId': id }, 'name type price status interestRate investors');
    
    // Construire le portefeuille avec les parts détenues
    const portfolio = properties.map(property => {
      const investorData = property.investors.find(inv => inv.investorId.toString() === id);
      return {
        propertyId: property._id,
        name: property.name,
        type: property.type,
        price: property.price,
        status: property.status,
        interestRate: property.interestRate,
        shares: investorData ? investorData.shares : 0,
      };
    });

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
};

// Investir dans une propriété
exports.investInProperty = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.status !== 'open') {
      return res.status(400).json({ message: 'Property is not open for funding' });
    }

    if (req.investor.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds in wallet' });
    }

    if (property.totalFunded + amount > property.price) {
      return res.status(400).json({ message: `The maximum amount you can invest is: ${property.price - property.totalFunded}` });
    }

    // Mettre à jour le portefeuille de l'investisseur
    req.investor.wallet.balance -= amount;
    req.investor.wallet.transactions.push({ type: 'investment', amount, propertyId: property._id });
    req.investor.propertiesOwned.push({investorId: property._id, shares: (amount * 100) / property.price });
    await req.investor.save();

    // Mettre à jour la propriété
    property.totalFunded += amount;
    property.investors.push({ investorId: req.investor._id, shares: (amount * 100) / property.price });
    if (property.totalFunded == property.price) {
      property.status = 'closed';
    }
    await property.save();

    const emailPromises = sendReceiptEmail(req.investor.email, amount);

    await Promise.all([emailPromises]);
    
    res.status(200).json({ message: 'Investment successful', property });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(req.investor.wallet.balance)
  }
};

// Rembourser les investisseurs si la propriété n'est pas entièrement financée dans les 2 mois
exports.refundInvestors = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.status !== 'open') {
      return res.status(400).json({ message: 'Property is not open for funding' });
    }

    const now = new Date();
    const fundingDeadline = new Date(property.fundingDeadline);
    fundingDeadline.setMonth(fundingDeadline.getMonth() + 2);

    if (now < fundingDeadline) {
      return res.status(400).json({ message: 'Funding deadline has not passed' });
    }

    // Rembourser les investisseurs
    for (const investorData of property.investors) {
      const investor = await Investor.findById(investorData.investorId);
      if (investor) {
        const refundAmount = (investorData.shares * property.price) / 100;
        investor.wallet.balance += refundAmount;
        investor.wallet.transactions.push({ type: 'refund', amount: refundAmount, propertyId: property._id });
        await investor.save();
      }
    }

    // Mettre à jour la propriété
    property.status = 'closed';
    await property.save();

    const emailPromises = sendReceiptEmail(req.investor.email);

    await Promise.all([emailPromises]);

    res.status(200).json({ message: 'Investors refunded successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Ajouter le revenu locatif mensuel au portefeuille de l'investisseur
exports.addRentalIncome = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.status !== 'closed') {
      return res.status(400).json({ message: 'Property is not closed' });
    }

    // Ajouter le revenu locatif mensuel au portefeuille de chaque investisseur
    for (const investorData of property.investors) {
      const investor = await Investor.findById(investorData.investorId);
      if (investor) {
        const income = (investorData.shares * property.price * property.interestRate) / 100;
        investor.wallet.balance += income;
        investor.wallet.transactions.push({ type: 'income', amount: income, propertyId: property._id });
        await investor.save();
      }
    }

    res.status(200).json({ message: 'Rental income added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

