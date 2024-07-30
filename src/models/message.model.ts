import mongoose, { InferSchemaType } from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "sender field is required"],
        },
        content: {
            type: String,
            required: [true, "Message cannot be empty"],
        },
        mediaFile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
        },
    },
    {
        timestamps: true,
    }
);

export type TMessage = InferSchemaType<typeof messageSchema>;

const Message =
    (mongoose.models.Message as mongoose.Model<TMessage>) ||
    mongoose.model<TMessage>("Message", messageSchema);

export default Message;
