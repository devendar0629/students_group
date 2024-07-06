import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/db.config";

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();

    try {
        return NextResponse.json(
            {
                success: true,
                message: "The server is Up and Running",
            },
            { status: 200 }
        );
    } catch (error: any) {
        throw new Error(error.message);
    }
}
