import mongoose from "mongoose";

const groupSchema = new mongoose.Schema<DB.Group>(
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

const Group = mongoose.model<DB.Group>("Group", groupSchema);
export default Group;
