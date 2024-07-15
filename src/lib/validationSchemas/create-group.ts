import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const createGroupSchema = z
    .object({
        name: z
            .string({
                message: "Name must be an string",
            })
            .min(1, {
                message: "Name should contain a minimum of 1 character",
            }),

        description: z
            .string({
                message: "Description must be an string",
            })
            .optional(),

        members: z
            .array(
                z.string({
                    message: "Members must be an array of strings",
                })
            )
            .optional(),
    })
    .refine((parsedValue) => {
        // Check every member is an valid mongoose object id
        return parsedValue.members?.every((member) => isValidObjectId(member));
    });
