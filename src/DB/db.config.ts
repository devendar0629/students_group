import mongoose, { connect as mongooseConnect, MongooseError } from "mongoose";

export const connectDB = async () => {
    try {
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

        console.log("Connection length: ", mongoose.connections.length);

        mongoose.connection.on("error", () => {
            console.error("🍀❌ MongoDB connection failed.");
            process.exit(1);
        });
    } catch (error: any) {
        console.error("🍀❌ MongoDB connection failed.");
        console.log(error.name, error.message);
        process.exit(1);
    }
};
