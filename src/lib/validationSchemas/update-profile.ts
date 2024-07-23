import { z } from "zod";

export const updateProfileSchema = z.object({
    bio: z
        .string({
            message: "Bio must be an string",
        })
        .optional(),

    name: z
        .string({
            message: "Name must be an string",
        })
        .min(1, {
            message: "Name cannot be empty",
        }),

    gender: z
        .string({
            message: "Gender must be an string",
        })
        .refine((value) => {
            return ["MALE", "FEMALE", "RATHER-NOT-SAY"].includes(value);
        }),

    avatar: z.custom((value) => {
        if (!value || value.length === 0) return true; // Handle falsy values and empty file lists

        if (value.length > 0) {
            const firstFile = value[0];

            if (firstFile.size > 1024 * 1024 * 5) {
                throw new z.ZodError([
                    {
                        code: "custom",
                        message: "Image size shouldn't exceed 5 MB",
                        path: ["avatar"],
                    },
                ]);
            }

            if (
                firstFile.size > 50 * 1024 * 1024 ||
                ![
                    "image/png",
                    "image/webp",
                    "image/jpeg",
                    "image/jpg",
                ].includes(firstFile.type)
            ) {
                throw new z.ZodError([
                    {
                        code: "custom",
                        message: "File format not accepted",
                        path: ["avatar"],
                    },
                ]);
            }
        }
        return true;
    }),

    dateOfBirth: z.string({
        message: "Invalid date type",
    }),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
