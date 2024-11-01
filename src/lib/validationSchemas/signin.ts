import { z } from "zod";

export const signinSchema = z.object({
    username_or_email: z
        .string({
            message: "Incorrect type received",
        })
        .min(2, {
            message:
                "Username or email should contain a minimum of 2 characters",
        }),

    password: z
        .string({
            message: "Password must be an string",
        })
        .min(6, "Password should contain a minimum of 6 characters"),
});

export type SigninSchema = z.infer<typeof signinSchema>;
