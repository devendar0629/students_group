import mongoose, { InferSchemaType } from "mongoose";

const groupMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "user id field is required for group user"],
        },
    },
    { timestamps: true }
);

const groupSchema = new mongoose.Schema(
    {
        admin: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "GroupMember",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GroupMember",
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
                ref: "GroupMember",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export type TGroup = InferSchemaType<typeof groupSchema>;
export type TGroupMember = InferSchemaType<typeof groupMemberSchema>;

const Group =
    (mongoose.models.Group as mongoose.Model<TGroup>) ||
    mongoose.model<TGroup>("Group", groupSchema);

const GroupMember =
    (mongoose.models.GroupMember as mongoose.Model<TGroupMember>) ||
    mongoose.model<TGroupMember>("GroupMember", groupMemberSchema);

export default Group;

export { GroupMember };
