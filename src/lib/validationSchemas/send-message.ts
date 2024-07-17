import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const sendMessageSchema = z.object({
    sender: z
        .string({
            message: "Sender must be an string",
        })
        .refine(
            (data) => {
                return isValidObjectId(data);
            },
            { message: "sender value is invalid" }
        ),

    content: z
        .string({
            message: "Message must be a string",
        })
        .min(1, {
            message: "Message field is required",
        }),

    mediaFile: z
        .any()
        .optional()
        .refine(
            (value) => {
                return value instanceof File;
            },
            {
                message: "Invalid file",
            }
        )
        .refine(
            (value) => {
                return value.size <= 1024 * 1024 * 512;
            },
            {
                message: "File size cannot exceed 0.1 MB",
            }
        )
        .refine(
            (value) => {
                return [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "audio/mpeg",
                    "video/mp4",
                    "video/mpeg",
                    "application/pdf",
                    "application/msword",
                ].includes(value.type);
            },
            { message: "File format not accepted" }
        ),
});
