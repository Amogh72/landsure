const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    contact: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    account_type: { type: String, enum: ['Buyer', 'Seller'], required: true },
    govt_id_type: { type: String, enum: ['Aadhar', 'PAN', 'Passport'], required: true },
    govt_id_number: { type: String, required: true },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
});

// Hash password before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);