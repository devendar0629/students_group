import { z } from "zod";

export const verifyEmailSchema = z.object({
    user_id: z
        .string({
            message: "Invalid user id",
        })
        .min(24, {
            message: "Invalid user id",
        })
        .max(24, {
            message: "Invalid user id",
        }),

    verificationCode: z
        .string({
            message: "Verification code must be an string",
        })
        .min(6, {
            message: "Invalid verification code",
        })
        .max(6, {
            message: "Invalid verification code",
        }),
});
