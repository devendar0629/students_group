import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const currentUserId = await getIdFromRequest(request);

        const user = await User.findById(currentUserId).select("-password");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User not found",
                    },
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Current user fetched successfully",
                data: user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("ERROR: ", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong",
                },
            },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
