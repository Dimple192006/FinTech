import crypto from "crypto";
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      default: "Demo User"
    },
    totalAmount: Number,
    remainingAmount: Number,
    tokenPin: String,
    tokenId: String,
    qrPayload: String,
    expiresAt: Date,
    status: {
      type: String,
      default: "active"
    },
    transactions: [
      {
        merchantId: String,
        amount: Number,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    failedAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

tokenSchema.pre("save", function saveToken(next) {
  if (!this.tokenId) {
    this.tokenId = crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  if (this.isNew && typeof this.remainingAmount !== "number") {
    this.remainingAmount = this.totalAmount;
  }

  if (!this.qrPayload) {
    this.qrPayload = JSON.stringify({
      tokenId: this.tokenId,
      amount: this.remainingAmount,
      expiresAt: this.expiresAt
    });
  }

  next();
});

export default mongoose.model("Token", tokenSchema);
