import { z } from "zod";

export const updateGroupSchema = z.object({
    name: z
        .string({
            message: "Group name must be a string",
        })
        .min(1, {
            message: "Group name should not be empty",
        }),

    description: z
        .string({
            message: "Group description must be a string",
        })
        .min(1, {
            message: "Group description should not be empty",
        })
        .optional(),
});

export type UpdateGroupSchema = z.infer<typeof updateGroupSchema>;
