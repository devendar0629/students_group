import mongoose, { InferSchemaType } from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export type TFriendRequest = InferSchemaType<typeof friendRequestSchema>;

const FriendRequest =
    (mongoose.models.FriendRequest as mongoose.Model<TFriendRequest>) ||
    mongoose.model<TFriendRequest>("FriendRequest", friendRequestSchema);

export default FriendRequest;
