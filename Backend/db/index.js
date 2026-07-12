import { DB_NAME } from "../utils/constants.js";
import mongoose from "mongoose";

const DBConnnet = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`MongoDB connected Successfully... ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error", error)
        throw error
    }
}

export { DBConnnet }