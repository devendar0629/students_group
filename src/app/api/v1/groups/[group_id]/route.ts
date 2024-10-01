import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { ZodError } from "zod";
import { updateGroupSchema } from "@/lib/validationSchemas/update-group";

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
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                avatar: 1,
                                username: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$createdBy",
                    preserveNullAndEmptyArrays: true,
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
                                name: 1,
                                username: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    members: {
                        $map: {
                            input: "$members",
                            as: "member",
                            in: {
                                _id: "$$member._id",
                                isAdmin: {
                                    $in: ["$$member._id", "$admin"],
                                },
                                isCreator: {
                                    $eq: ["$$member._id", "$createdBy._id"],
                                },
                                name: "$$member.name",
                                username: "$$member.username",
                                avatar: "$$member.avatar",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    messages: 0,
                },
            },
        ]);

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

export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    try {
        const data = await request.json();
        const validatedData = updateGroupSchema.parse(data);

        const groupId = params.group_id;

        if (!isValidObjectId(groupId)) {
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

        if (!(await Group.exists({ _id: groupId }))) {
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

        await Group.findByIdAndUpdate(groupId, {
            name: validatedData.name,
            description: validatedData.description,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Group details are updated successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "Something went wrong while updating the group details",
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
                        "Something went wrong while updating the group details",
                },
            },
            { status: 500 }
        );
    }
}
