import mongoose, { connect as mongooseConnect, MongooseError } from "mongoose";

export const connectDB = async () => {
    await mongooseConnect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    })
        .then(() => {
            console.log("🍀✅ MongoDB connection Succeeded.");
        })
        .catch((err: any) => {
            console.error("🍀❌ MongoDB connection failed.");
            process.exit(1);
        });

    mongoose.connection.on("error", () => {
        console.error("🍀❌ MongoDB connection failed.");
        process.exit(1);
    });
};
