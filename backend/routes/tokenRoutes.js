import express from "express";
const router = express.Router();

// ✅ FIXED (use import, NOT require)
import { createToken, redeemToken } from "../controller/tokenController.js";

// routes
router.post("/create", createToken);
router.post("/redeem", redeemToken);

export default router;