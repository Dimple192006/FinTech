import bcrypt from "bcrypt";
import Token from "../model/Token.js";

const INITIAL_WALLET_BALANCE = 1000;
const VALIDITY_MAP = {
  day: 1,
  week: 7,
  month: 30,
  year: 365
};

function getExpiryDate(validity) {
  const days = VALIDITY_MAP[validity];

  if (!days) {
    return null;
  }

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const normalizeToken = (token) => {
  const now = new Date();
  const isExpired = token.expiresAt && new Date(token.expiresAt) < now;

  return {
    id: token._id,
    user: token.user,
    tokenId: token.tokenId,
    totalAmount: token.totalAmount,
    remainingAmount: token.remainingAmount,
    qrPayload: token.qrPayload,
    expiresAt: token.expiresAt,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
    status: isExpired && token.status === "active" ? "expired" : token.status,
    transactions: token.transactions,
    failedAttempts: token.failedAttempts,
    isLocked: token.isLocked
  };
};

const sampleTokenSeed = [
  {
    user: "Demo User",
    totalAmount: 150,
    remainingAmount: 150,
    tokenId: "TKNDEMO1",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "active",
    transactions: []
  },
  {
    user: "Demo User",
    totalAmount: 250,
    remainingAmount: 150,
    tokenId: "TKNDEMO2",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "partially_used",
    transactions: [
      {
        merchantId: "Smart Bazaar",
        amount: 60,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        merchantId: "Metro Store",
        amount: 40,
        timestamp: new Date(Date.now() - 90 * 60 * 1000)
      }
    ]
  },
  {
    user: "Demo User",
    totalAmount: 100,
    remainingAmount: 0,
    tokenId: "TKNDEMO3",
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "expired",
    transactions: [
      {
        merchantId: "Aavin Booth",
        amount: 100,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]
  }
];

async function buildWalletSummary() {
  const tokens = await Token.find().sort({ createdAt: -1 });
  const normalizedTokens = tokens.map(normalizeToken);

  const lockedAmount = normalizedTokens
    .filter((token) => token.status === "active" || token.status === "partially_used")
    .reduce((sum, token) => sum + Number(token.remainingAmount || 0), 0);

  const availableBalance = Math.max(INITIAL_WALLET_BALANCE - lockedAmount, 0);

  return {
    tokens: normalizedTokens,
    wallet: {
      initialBalance: INITIAL_WALLET_BALANCE,
      availableBalance,
      lockedAmount
    }
  };
}

export async function ensureSampleTokens() {
  const hashedPin = await bcrypt.hash("1234", 10);

  for (const item of sampleTokenSeed) {
    const existingToken = await Token.findOne({ tokenId: item.tokenId });

    if (existingToken) {
      continue;
    }

    await Token.create({
      ...item,
      tokenPin: hashedPin,
      qrPayload: JSON.stringify({
        tokenId: item.tokenId,
        amount: item.totalAmount,
        expiresAt: item.expiresAt
      })
    });
  }
}

export const createToken = async (req, res) => {
  try {
    const {
      user = "Demo User",
      amount,
      pin,
      validity = "day"
    } = req.body;
    const parsedAmount = Number(amount);
    const expiryDate = getExpiryDate(validity);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!pin || String(pin).length < 4) {
      return res.status(400).json({ message: "PIN must be at least 4 digits" });
    }

    if (!expiryDate) {
      return res.status(400).json({ message: "Select a valid token validity" });
    }

    const walletSummary = await buildWalletSummary();

    if (parsedAmount > walletSummary.wallet.availableBalance) {
      return res.status(400).json({
        message: "Insufficient wallet balance for token creation"
      });
    }

    const hashedPin = await bcrypt.hash(String(pin), 10);

    const token = new Token({
      user,
      totalAmount: parsedAmount,
      tokenPin: hashedPin,
      expiresAt: expiryDate
    });

    await token.save();

    const updatedSummary = await buildWalletSummary();
    const createdToken = updatedSummary.tokens.find(
      (item) => item.tokenId === token.tokenId
    );

    res.status(201).json({
      message: "Token created",
      token: createdToken,
      wallet: updatedSummary.wallet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listTokens = async (req, res) => {
  try {
    const summary = await buildWalletSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const redeemToken = async (req, res) => {
  try {
    const { tokenId, amount, pin } = req.body;
    const parsedAmount = Number(amount);

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

    const isMatch = await bcrypt.compare(String(pin), token.tokenPin);

    if (!isMatch) {
      token.failedAttempts += 1;
      if (token.failedAttempts >= 3) {
        token.isLocked = true;
      }
      await token.save();
      return res.status(401).json({ message: "Invalid PIN" });
    }

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (token.remainingAmount < parsedAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    token.remainingAmount -= parsedAmount;
    token.status =
      token.remainingAmount === 0 ? "redeemed" : "partially_used";

    token.transactions.push({
      merchantId: "demo",
      amount: parsedAmount
    });

    await token.save();

    const updatedSummary = await buildWalletSummary();

    res.json({
      message: "Payment successful",
      token: normalizeToken(token),
      wallet: updatedSummary.wallet
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

    res.json({
      token: normalizeToken(token)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
