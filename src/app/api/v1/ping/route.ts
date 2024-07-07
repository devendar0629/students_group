import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
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
