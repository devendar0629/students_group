import { z } from "zod";

export const updatePreferencesSchema = z
    .object({
        acceptGroupInvitesFrom: z
            .string({
                message:
                    "Field 'acceptGroupInvitesFrom' must be of type string",
            })
            .refine((value) => ["FRIENDS", "ANYONE"].includes(value), {
                message:
                    "acceptGroupInvitesFrom field must be either FRIENDS or ANYONE",
            })
            .optional(),

        theme: z
            .string({
                message: "Theme field must be of type string",
            })
            .refine(
                (value) => ["SYSTEM-DEFAULT", "LIGHT", "DARK"].includes(value),
                {
                    message:
                        "acceptGroupInvitesFrom field must be either LIGHT or DARK or SYSTEM-DEFAULT",
                }
            )
            .optional(),

        acceptFriendRequestsFromAnyone: z
            .boolean({
                message:
                    "Field acceptFriendRequestsFromAnyone must be either true or false",
            })
            .optional(),
    })
    .strict({
        message: "Payload must not contain any unknown keys",
    });

export type UpdatePreferencesSchema = z.infer<typeof updatePreferencesSchema>;
