import mongoose, { connect, Mongoose } from "mongoose";

if (!process.env.MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable in .env.local file"
    );
}

declare global {
    var __connection: {
        connection: null | Mongoose;
    };
}

let cachedConnection = global.__connection;

if (!cachedConnection) {
    cachedConnection = global.__connection = {
        connection: null,
    };
}

export const connectDB = async () => {
    // return if there's already a connection
    if (cachedConnection.connection) {
        return;
    }

    const options: mongoose.ConnectOptions = {
        dbName: process.env.DATABASE_NAME,
    };

    await connect(process.env.MONGODB_URI!, options)
        .then((responseConnection) => {
            cachedConnection.connection = responseConnection;
            console.log("🍀✅ MongoDB connection Succeeded.");
        })
        .catch((err: any) => {
            cachedConnection.connection = null;
            console.error("🍀❌ MongoDB connection failed.");
            process.exit(1);
        });
};
