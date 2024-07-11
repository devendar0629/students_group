import mongoose from "mongoose";

const messageSchema = new mongoose.Schema<DB.Message>(
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

const Message =
    (mongoose.models.Message as mongoose.Model<DB.Message>) ||
    mongoose.model<DB.Message>("Message", messageSchema);
export default Message;
