const mongoose = require("mongoose");

const SpendingLimitSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  monthlyLimit: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  categoryLimits: [{
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    warningThreshold: { type: Number, default: 80, min: 0, max: 100 } // Percentage for category warning
  }],
  alertSettings: {
    monthlyLimitEnabled: { type: Boolean, default: true },
    categoryLimitEnabled: { type: Boolean, default: true },
    incomeVsExpenseEnabled: { type: Boolean, default: true },
    monthlyWarningThreshold: { type: Number, default: 80, min: 0, max: 100 } // Percentage for monthly warning
  }
}, { timestamps: true });

// Ensure one spending limit per user
SpendingLimitSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("SpendingLimit", SpendingLimitSchema); 