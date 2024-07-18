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

    mediaFile: z.union([
        z.any().optional(),
        z.custom((value) => {
            if (!value) return true;

            if (!(value instanceof File)) {
                throw new z.ZodError([
                    {
                        path: [""],
                        code: "custom",
                        message: "Invalid File Type",
                    },
                ]);
            }

            if (value.size > 1024 * 1024 * 512) {
                throw new z.ZodError([
                    {
                        path: [""],
                        code: "custom",
                        message: "File size shouldn't exceed 512 MB",
                    },
                ]);
            }

            if (
                ![
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "audio/mpeg",
                    "video/mp4",
                    "video/mpeg",
                    "application/pdf",
                    "application/msword",
                ].includes(value.type)
            ) {
                throw new z.ZodError([
                    {
                        path: [""],
                        code: "custom",
                        message: "File format not accepted",
                    },
                ]);
            }

            return true;
        }),
    ]),
});
