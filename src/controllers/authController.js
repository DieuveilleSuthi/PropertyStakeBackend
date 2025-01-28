const Investor = require('../models/investorsModel');
const Agent = require('../models/agentsModel');
const jwt = require('jsonwebtoken');

// Login utilisateur (investor ou agent)
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;

    // Vérifie le rôle et récupère l'utilisateur
    if (role === 'investor') {
      user = await Investor.findOne({ email });
    } else if (role === 'agent') {
      user = await Agent.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Génère un token JWT
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { loginUser };
