const Property = require('../models/property');
const Agent = require('../models/agentsModel');
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

// Créer une nouvelle propriété
exports.createProperty = async (req, res) => {
  const { name, type, price, fundingDeadline, rentalIncome, status, totalFunded } = req.body;

  try {
    const property = new Property({
      name,
      type,
      price,
      fundingDeadline,
      rentalIncome,
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
