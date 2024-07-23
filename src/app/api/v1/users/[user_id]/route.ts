import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: {
        user_id: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const user_id = params.user_id;

        if (!isValidObjectId(user_id)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid user id",
                    },
                },
                { status: 400 }
            );
        }

        if (!(await User.exists({ _id: user_id }))) {
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

        const user = await User.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(user_id),
                },
            },
            {
                $project: {
                    password: 0,
                },
            },
        ]);

        return NextResponse.json(
            {
                success: true,
                data: user[0],
                message: "User fetched successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while fetching user details",
                },
            },
            { status: 500 }
        );
    }
}
