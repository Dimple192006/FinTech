import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import Token from "../model/Token.js";

const INITIAL_WALLET_BALANCE = 1000;
const VALIDITY_MAP = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "365d": 365,
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

function getResolvedStatus(token) {
  const isExpired = token.expiresAt && new Date(token.expiresAt) < new Date();

  if (isExpired && token.status !== "redeemed") {
    return "expired";
  }

  return token.status;
}

function normalizeToken(token) {
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
    status: getResolvedStatus(token),
    transactions: token.transactions,
    failedAttempts: token.failedAttempts,
    isLocked: token.isLocked
  };
}

function buildQrPayload(tokenId, amount, expiresAt) {
  return JSON.stringify({
    tokenId,
    amount,
    expiresAt
  });
}

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

let inMemoryTokens = [];

function isDatabaseAvailable() {
  return mongoose.connection.readyState === 1;
}

function cloneToken(token) {
  return {
    ...token,
    transactions: token.transactions.map((transaction) => ({ ...transaction }))
  };
}

function createMemoryToken(data) {
  const now = new Date();
  const tokenId = data.tokenId || crypto.randomBytes(8).toString("hex").toUpperCase();
  const remainingAmount =
    typeof data.remainingAmount === "number" ? data.remainingAmount : data.totalAmount;

  return {
    _id: data._id || crypto.randomUUID(),
    user: data.user || "Demo User",
    totalAmount: data.totalAmount,
    remainingAmount,
    tokenPin: data.tokenPin,
    tokenId,
    qrPayload: data.qrPayload || buildQrPayload(tokenId, remainingAmount, data.expiresAt),
    expiresAt: data.expiresAt,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    status: data.status || "active",
    transactions: (data.transactions || []).map((transaction) => ({
      merchantId: transaction.merchantId,
      amount: transaction.amount,
      timestamp: transaction.timestamp || now
    })),
    failedAttempts: data.failedAttempts || 0,
    isLocked: data.isLocked || false
  };
}

async function getAllTokens() {
  if (isDatabaseAvailable()) {
    return Token.find().sort({ createdAt: -1 });
  }

  return [...inMemoryTokens].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function findTokenByTokenId(tokenId) {
  if (isDatabaseAvailable()) {
    return Token.findOne({ tokenId });
  }

  return inMemoryTokens.find((token) => token.tokenId === tokenId) || null;
}

async function createStoredToken(data) {
  if (isDatabaseAvailable()) {
    return Token.create(data);
  }

  const token = createMemoryToken(data);
  inMemoryTokens.push(token);
  return token;
}

async function saveStoredToken(token) {
  if (isDatabaseAvailable()) {
    return token.save();
  }

  token.updatedAt = new Date();
  token.qrPayload = buildQrPayload(token.tokenId, token.remainingAmount, token.expiresAt);
  return token;
}

async function buildWalletSummary() {
  const tokens = await getAllTokens();
  const normalizedTokens = tokens.map(normalizeToken);

  const lockedAmount = normalizedTokens
    .filter((token) => token.status === "active" || token.status === "partially_used")
    .reduce((sum, token) => sum + Number(token.remainingAmount || 0), 0);

  return {
    tokens: normalizedTokens,
    wallet: {
      initialBalance: INITIAL_WALLET_BALANCE,
      availableBalance: Math.max(INITIAL_WALLET_BALANCE - lockedAmount, 0),
      lockedAmount
    }
  };
}

export async function ensureSampleTokens() {
  const hashedPin = await bcrypt.hash("1234", 10);

  for (const item of sampleTokenSeed) {
    const existingToken = await findTokenByTokenId(item.tokenId);

    if (existingToken) {
      continue;
    }

    await createStoredToken({
      ...item,
      tokenPin: hashedPin,
      qrPayload: buildQrPayload(item.tokenId, item.remainingAmount, item.expiresAt)
    });
  }
}

export const createToken = async (req, res) => {
  try {
    const { user = "Demo User", amount, pin, validity = "1d" } = req.body;
    const parsedAmount = Number(amount);
    const expiresAt = getExpiryDate(validity);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!pin || String(pin).length < 4) {
      return res.status(400).json({ message: "PIN must be at least 4 digits" });
    }

    if (!expiresAt) {
      return res.status(400).json({ message: "Select a valid token validity" });
    }

    const walletSummary = await buildWalletSummary();

    if (parsedAmount > walletSummary.wallet.availableBalance) {
      return res.status(400).json({
        message: "Insufficient wallet balance for token creation"
      });
    }

    const hashedPin = await bcrypt.hash(String(pin), 10);
    const token = await createStoredToken({
      user,
      totalAmount: parsedAmount,
      remainingAmount: parsedAmount,
      tokenPin: hashedPin,
      expiresAt
    });

    token.qrPayload = buildQrPayload(token.tokenId, token.remainingAmount, token.expiresAt);
    await saveStoredToken(token);

    const updatedSummary = await buildWalletSummary();
    const createdToken = updatedSummary.tokens.find(
      (item) => item.tokenId === token.tokenId
    );

    return res.status(201).json({
      success: true,
      message: "Token created",
      token: createdToken,
      wallet: updatedSummary.wallet
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const listTokens = async (req, res) => {
  try {
    const summary = await buildWalletSummary();
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

export const redeemToken = async (req, res) => {
  try {
    const { tokenId, amount, pin, merchantId = "demo" } = req.body;
    const parsedAmount = Number(amount);

    const token = await findTokenByTokenId(tokenId);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (new Date() > token.expiresAt) {
      token.status = "expired";
      await saveStoredToken(token);
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
      await saveStoredToken(token);
      return res.status(401).json({ message: "Invalid PIN" });
    }

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (token.remainingAmount < parsedAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    token.remainingAmount -= parsedAmount;
    token.failedAttempts = 0;
    token.status = token.remainingAmount === 0 ? "redeemed" : "partially_used";
    token.transactions.push({
      merchantId,
      amount: parsedAmount
    });
    token.qrPayload = buildQrPayload(token.tokenId, token.remainingAmount, token.expiresAt);

    await saveStoredToken(token);

    const updatedSummary = await buildWalletSummary();

    return res.json({
      success: true,
      message: "Payment successful",
      token: normalizeToken(token),
      wallet: updatedSummary.wallet
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const token = await findTokenByTokenId(tokenId);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    return res.json({
      token: normalizeToken(token)
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
