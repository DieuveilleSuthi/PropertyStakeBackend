const mongoose = require('mongoose');

const walletSchema = mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [
      {
        type: { type: String, enum: ['recharge', 'investment', 'income', 'refund'], required: true },
        amount: { type: Number, default: 0, required: true },
        date: { type: Date, default: Date.now },
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
