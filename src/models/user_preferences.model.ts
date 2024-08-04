import mongoose, { InferSchemaType } from "mongoose";

const userPreferencesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        acceptGroupInvitesFrom: {
            type: String,
            default: "FRIENDS",
            enum: ["FRIENDS", "ANYONE"],
            validate: (value: string) => ["FRIENDS", "ANYONE"].includes(value),
        },
        acceptFriendRequestsFromAnyone: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String,
            enum: ["SYSTEM-DEFAULT", "LIGHT", "DARK"],
            default: "DARK",
            validate: (value: string) =>
                ["SYSTEM-DEFAULT", "LIGHT", "DARK"].includes(value),
        },
    },
    {
        timestamps: true,
    }
);

export type TUserPreferences = InferSchemaType<typeof userPreferencesSchema>;

const UserPreferences =
    (mongoose.models.UserPreferences as mongoose.Model<TUserPreferences>) ||
    mongoose.model<TUserPreferences>("UserPreferences", userPreferencesSchema);

export default UserPreferences;
