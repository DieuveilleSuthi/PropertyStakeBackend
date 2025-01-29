const mongoose = require('mongoose');

const propertySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    interestRate: { type: Number, required: true }, 
    fundingDeadline: { type: Date, required: true }, 
    totalFunded: { type: Number, default: 0 },
    investors: [
      {
        investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor' },
        shares: { type: Number, default: 0, required: true }, 
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);
