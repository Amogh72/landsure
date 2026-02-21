const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: String, required: true },
    type: { type: String, required: true },
    imageUrl: { type: String, required: true },

    direction: { type: String },           // e.g., North, East
    soil: { type: String },                // e.g., Clay, Sandy
    water: { type: String },               // Water access info
    legal: { type: String },               // Legal status

    // Owner info
    ownerName: { type: String },
    ownerContact: { type: String },
    ownerEmail: { type: String },
    ownerAddress: { type: String },
    ownerNotes: { type: String },

    // Extra info
    landmarks: { type: String },           // Nearby landmarks
    roadDistance: { type: String },        // Distance from main road
    envNotes: { type: String },            // Environmental notes
    devPotential: { type: String },        // Development potential

    // Description & media
    description: { type: String },
    isFeatured: { type: Boolean, default: false },
    featuredPaidAmount: { type: Number, default: 0 },
    latitude: {type: Number}, 
    longitude: {type: Number},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // New fields for blockchain integration
    certificateId: { type: String, required: true },
    tokenId: { type: String, required: true },
    currentOwnerAddress: { type: String, required: true },
    
    createdAt: { type: Date, default: Date.now }
});

// Reuse existing model if already compiled
module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);