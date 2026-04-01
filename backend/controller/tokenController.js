import Token from "../model/Token.js";
import bcrypt from "bcrypt";

// ✅ CREATE TOKEN
export const createToken = async (req, res) => {
  try {
    const { user, amount, pin } = req.body;

    // hash pin
    const hashedPin = await bcrypt.hash(pin, 10);

    const token = new Token({
      user,
      totalAmount: amount,
      tokenPin: hashedPin,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
    });

    await token.save();

    res.status(201).json({
      message: "Token created",
      tokenId: token.tokenId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const redeemToken = async (req, res) => {
  try {
    const { tokenId, amount, pin } = req.body;

    const token = await Token.findOne({ tokenId });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (new Date() > token.expiresAt) {
      token.status = "expired"; 
      await token.save();
      return res.status(400).json({ message: "Token expired" });
    }

    if (token.isLocked) {
      return res.status(403).json({ message: "Token locked" });
    }

    const isMatch = await bcrypt.compare(pin, token.tokenPin);

    if (!isMatch) {
      token.failedAttempts += 1;
      if (token.failedAttempts >= 3) token.isLocked = true;
      await token.save();
      return res.status(401).json({ message: "Invalid PIN" });
    }

    if (token.remainingAmount < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    token.remainingAmount -= amount;

    token.status =
      token.remainingAmount === 0 ? "redeemed" : "partially_used";

    token.transactions.push({
      merchantId: "demo",
      amount
    });

    await token.save();

    res.json({
      message: "Payment successful",
      remainingBalance: token.remainingAmount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getToken = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = await Token.findOne({ tokenId });

    if (!token) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};