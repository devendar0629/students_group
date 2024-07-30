import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        username: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            min: [6, "Password cannot be smaller than 6 characters"],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        avatar: {
            type: String,
            default: "",
            required: false,
        },
        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "RATHER-NOT-SAY"],
            validate: (value: string) => {
                return ["MALE", "FEMALE", "RATHER-NOT-SAY"].includes(value);
            },
            required: false,
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        bio: {
            type: String,
            default: "Students group is nice...",
        },
        joinedGroups: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Group",
            },
        ],
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        pendingInvitesAndRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FriendRequest",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export type TUser = InferSchemaType<typeof userSchema>;

const User =
    (mongoose.models.User as mongoose.Model<TUser>) ||
    mongoose.model<TUser>("User", userSchema);

export default User;
