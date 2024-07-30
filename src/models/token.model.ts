import mongoose, { InferSchemaType } from "mongoose";

const tokenSchema = new mongoose.Schema(
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

export type TToken = InferSchemaType<typeof tokenSchema>;

const Token =
    (mongoose.models.Token as mongoose.Model<TToken>) ||
    mongoose.model<TToken>("Token", tokenSchema);

export default Token;
