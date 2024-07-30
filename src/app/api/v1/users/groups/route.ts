import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Fetch all groups of a user
// In each group the latest message (only one) is fetched
// In the message , the sender and its content is only fetched
export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const userId = await getIdFromRequest(request);

        if (!isValidObjectId(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "Something went wrong while fetching the user's groups",
                    },
                },
                { status: 400 }
            );
        }

        const userGroups = await User.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(userId!),
                },
            },
            {
                $project: {
                    joinedGroups: 1,
                },
            },
            {
                $lookup: {
                    from: "groups",
                    localField: "joinedGroups",
                    foreignField: "_id",
                    as: "joinedGroups",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                messages: 1,
                            },
                        },
                        {
                            $lookup: {
                                from: "messages",
                                localField: "messages",
                                foreignField: "_id",
                                as: "messages",
                                pipeline: [
                                    {
                                        $sort: {
                                            createdAt: -1,
                                        },
                                    },
                                    {
                                        $limit: 1,
                                    },
                                    {
                                        $lookup: {
                                            from: "media",
                                            localField: "mediaFile",
                                            foreignField: "_id",
                                            as: "mediaFile",
                                            pipeline: [
                                                {
                                                    $project: {
                                                        link: 1,
                                                        fileName: 1,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $unwind: {
                                            path: "$mediaFile",
                                            preserveNullAndEmptyArrays: true,
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "users",
                                            localField: "sender",
                                            foreignField: "_id",
                                            as: "sender",
                                            pipeline: [
                                                {
                                                    $project: {
                                                        name: 1,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $unwind: {
                                            path: "$sender",
                                            preserveNullAndEmptyArrays: true,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$messages",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
        ]);

        return NextResponse.json(
            {
                success: true,
                message: "User groups fetched successfully",
                data: userGroups[0],
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong while fetching the user's groups",
                },
            },
            { status: 500 }
        );
    }
}
