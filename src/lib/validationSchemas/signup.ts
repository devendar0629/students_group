import { z } from "zod";

export const signupSchema = z.object({
    name: z
        .string({
            message: "Name must be an string",
        })
        .min(1, {
            message: "Name should not be empty",
        }),

    username: z
        .string({
            message: "Username must be an string",
        })
        .min(2, {
            message: "Username should contain a minimum of 2 characters",
        })
        .regex(/^[a-zA-Z0-9_\-.]*$/, {
            message: "Username shouldn't contain special characters",
        }),

    email: z
        .string({
            message: "Email must be a string",
        })
        .email({
            message: "Invalid email",
        }),

    password: z
        .string({
            message: "Password must be an string",
        })
        .min(6, "Password should contain a minimum of 6 characters"),
});

export type SignupSchema = z.infer<typeof signupSchema>;
