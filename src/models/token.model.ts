import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema<DB.Token>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "user field is required in Token"],
        },
        verificationCode: {
            type: String,
        },
        verificationCodeExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Token = mongoose.model<DB.Token>("Token", tokenSchema);
export default Token;
