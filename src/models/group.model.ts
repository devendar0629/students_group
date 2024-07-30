import mongoose, { InferSchemaType } from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "admin field is required in Group"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "createdBy field is required in Group"],
        },
        description: {
            type: String,
        },
        name: {
            type: String,
            required: [true, "name field is required in Group"],
        },
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export type TGroup = InferSchemaType<typeof groupSchema>;

const Group =
    (mongoose.models.Group as mongoose.Model<TGroup>) ||
    mongoose.model<TGroup>("Group", groupSchema);

export default Group;
