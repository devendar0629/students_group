import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const currentUserId = await getIdFromRequest(request);
        const currentUserFriends = await User.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(currentUserId!),
                },
            },
            {
                $project: {
                    friends: 1,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "friends",
                    foreignField: "_id",
                    as: "friends",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        return NextResponse.json(
            {
                success: true,
                message: "Friends fetched successfully",
                data: currentUserFriends[0],
            },
            { status: 200 }
        );
    } catch (error) {
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
