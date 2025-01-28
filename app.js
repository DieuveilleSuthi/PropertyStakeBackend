require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const investorRoutes = require('./src/routes/investorRoutes');
const agentRoutes = require('./src/routes/agentRoutes');
const authRoutes = require('./src/routes/authRoutes')


const app = express();

// Configuration de la connexion MongoDB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connection successful'))
  .catch((err) => console.error('DB connection error:', err));

// Middleware
app.use(cors()); // Permettre les requêtes cross-origin
app.use(express.json()); // Parser le body des requêtes en JSON

//routes
app.use('/api/investors', investorRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);


// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});