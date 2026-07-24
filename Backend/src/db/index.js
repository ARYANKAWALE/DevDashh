import { DB_NAME } from "../utils/constants.js";
import mongoose from "mongoose";

const DBConnnet = async () => {
  // tolerate a trailing slash in MONGO_URI so the db name doesn't get mangled
  const base = (process.env.MONGO_URI ?? "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("MONGO_URI is not set — see Backend/.env.example");
  }

  const connectionInstance = await mongoose.connect(`${base}/${DB_NAME}`);
  console.log(
    `MongoDB connected Successfully... ${connectionInstance.connection.host}`
  );
  return connectionInstance;
};

export { DBConnnet };
