import express from "express";
import {
  createToken,
  getToken,
  listTokens,
  redeemToken
} from "../controller/tokenController.js";

const router = express.Router();

router.get("/", listTokens);
router.get("/:tokenId", getToken);
router.post("/create", createToken);
router.post("/redeem", redeemToken);

export default router;
