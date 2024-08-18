import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface RouteParams {
    params: {
        group_id: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const group_id = params.group_id;

        if (!isValidObjectId(group_id)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid group id",
                    },
                },
                { status: 400 }
            );
        }

        if (!(await Group.exists({ _id: group_id }))) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Group not found",
                    },
                },
                { status: 404 }
            );
        }

        const group = await Group.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(group_id),
                },
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "admin",
                    as: "admin",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                username: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$admin",
                },
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "createdBy",
                    as: "createdBy",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                username: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$createdBy",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "members",
                    foreignField: "_id",
                    as: "members",
                    pipeline: [
                        {
                            $project: {
                                avatar: 1,
                                name: 1,
                                username: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    messages: 0,
                },
            },
        ]);

        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Group not found",
                    },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Group fetched successfully",
            data: group[0],
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong, while fetching the group",
                },
            },
            { status: 500 }
        );
    }
}
