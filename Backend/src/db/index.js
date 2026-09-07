import { DB_NAME } from "../utils/constants.js";
import mongoose from "mongoose";

const DBConnnet = async () => {
  //   const base = (process.env.MONGO_URI ?? "").trim().replace(/\/+$/, "");
  //   if (!base) {
  //     throw new Error("MONGO_URI is not set!");
  //   }

    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(
        `MongoDB connected Successfully... ${connectionInstance.connection.host}`
    );
    return connectionInstance;
};

export { DBConnnet };
