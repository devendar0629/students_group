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
                z
                    .string({
                        message: "Members must be an array of strings",
                    })
                    .refine((value) => isValidObjectId(value))
            )
            .refine((value) => value.length > 0, {
                message: "There should be atleast one member",
            }),
    })
    .refine((parsedValue) => {
        // Check every member is an valid mongoose object id
        if (
            typeof parsedValue.members == typeof [] &&
            parsedValue.members &&
            parsedValue.members.length > 0
        )
            return parsedValue.members?.every((member) =>
                isValidObjectId(member)
            );
        else return false;
    });
