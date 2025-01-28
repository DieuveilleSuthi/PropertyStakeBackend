const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const agentSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        managedProperties: [
            {
                propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
                name: { type: String },
                status: { type: String, enum: ['open', 'closed'], default: 'open' },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);

// Hash password before saving
agentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Méthode pour vérifier le mot de passe
agentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};