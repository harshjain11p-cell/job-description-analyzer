import express from "express";
import analysisRoutes from "./routes/analysisRoutes.js";

const app = express();

app.use(express.json());

app.use("/", analysisRoutes);

export default app;