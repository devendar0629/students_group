import mongoose, { InferSchemaType } from "mongoose";

const mediaSchema = new mongoose.Schema(
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

export type Media = InferSchemaType<typeof mediaSchema>;

const Media =
    (mongoose.models.Media as mongoose.Model<Media>) ||
    mongoose.model<Media>("Media", mediaSchema);

export default Media;
