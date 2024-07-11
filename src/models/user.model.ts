import mongoose from "mongoose";

const userSchema = new mongoose.Schema<DB.User>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        username: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
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
            enum: ["Male", "Female"],
            validate: (value: string) => {
                return value === "Female" || value === "Male";
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
    },
    {
        timestamps: true,
    }
);

const User =
    (mongoose.models.User as mongoose.Model<DB.User>) ||
    mongoose.model<DB.User>("User", userSchema);

export default User;
