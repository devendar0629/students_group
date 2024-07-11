import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema<DB.Media>(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "sender field is required in Media"],
        },
        link: {
            type: String,
            required: [true, "link field is required in Media"],
        },
    },
    {
        timestamps: true,
    }
);

const Media =
    (mongoose.models.Media as mongoose.Model<DB.Media>) ||
    mongoose.model<DB.Media>("Media", mediaSchema);
export default Media;
