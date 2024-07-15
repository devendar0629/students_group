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

        // to be updated to populate members and messages
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
                                password: 0,
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
                                password: 0,
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
