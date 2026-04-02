import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import { ensureSampleTokens } from "./controller/tokenController.js";
import tokenRoutes from "./routes/tokenRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello From Server");
});

app.use("/api/token", tokenRoutes);

connectDB().then(async () => {
  await ensureSampleTokens();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
