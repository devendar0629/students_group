import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const sendMessageInGroupSchema = z.object({
    group_id: z
        .string({
            message: "Group id must be an string",
        })
        .refine(
            (value) => {
                return isValidObjectId(value);
            },
            { message: "Invalid group id" }
        ),

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

            if (value instanceof File && value.size === 0) {
                throw new z.ZodError([
                    {
                        path: [""],
                        code: "custom",
                        message: "Empty file is not accepted",
                    },
                ]);
            }

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

export const sendMessageInGroupSchemaClient = z.object({
    content: sendMessageInGroupSchema.shape.content,
});

export const mediaFileSchemaClient = z.object({
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

            // validate the size of file
            if (value.size > 1024 * 1024 * 100) {
                throw new z.ZodError([
                    {
                        path: [""],
                        code: "custom",
                        message: "File size shouldn't exceed 512 MB",
                    },
                ]);
            }

            // validate the type of file
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

export type SendMessageInGroupSchema = z.infer<typeof sendMessageInGroupSchema>;

export type SendMessageInGroupSchemaClient = z.infer<
    typeof sendMessageInGroupSchemaClient
>;
