const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const investorSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        wallet: {
            balance: { type: Number, default: 0 },
            transactions: [
                {
                    type: {
                        type: String,
                        enum: ['recharge', 'investment', 'income'],
                    },
                    amount: { type: Number },
                    date: { type: Date, default: Date.now },
                    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
                },
            ],
        },
        propertiesOwned: [
            {
                propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
                shares: { type: Number },
            },
        ],
    },
    { timestamps: true }
);

// Hash password before saving
investorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Méthode pour vérifier le mot de passe
investorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Investor', investorSchema);
