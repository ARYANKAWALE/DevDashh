import express from "express";
import { DBConnnet } from "./src/db/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
DBConnnet();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
