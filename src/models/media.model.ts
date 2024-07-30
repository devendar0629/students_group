import mongoose, { InferSchemaType } from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        fileName: {
            type: String,
            required: [true, "file name field is required"],
        },
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

export type TMedia = InferSchemaType<typeof mediaSchema>;

const Media =
    (mongoose.models.Media as mongoose.Model<TMedia>) ||
    mongoose.model<TMedia>("Media", mediaSchema);

export default Media;
