import { updatePreferencesSchema } from "@/lib/validationSchemas/update-preferences";
import UserPreferences from "@/models/user_preferences.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function PATCH(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    try {
        const reqData = await request.json();

        const validatedData = updatePreferencesSchema.parse(reqData);

        const currentUserId = await getIdFromRequest(request);
        await UserPreferences.findOneAndUpdate(
            {
                user: currentUserId,
            },
            validatedData
        );

        return NextResponse.json(
            {
                success: false,
                message: "User preferences updated successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid request payload",
                    },
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong while updating user preferences",
                },
            },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    try {
        const userId = await getIdFromRequest(request);

        const responsePreferences = await UserPreferences.findOne({
            user: userId,
        }).select("-user");

        if (!responsePreferences)
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "Something went wrong while fetching preferences",
                    },
                },
                { status: 500 }
            );

        return NextResponse.json(
            {
                success: false,
                message: "User prefernces fetched successfully",
                data: responsePreferences,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while fetching preferences",
                },
            },
            { status: 500 }
        );
    }
}
