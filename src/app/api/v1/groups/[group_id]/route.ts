import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { ZodError } from "zod";
import { updateGroupSchema } from "@/lib/validationSchemas/update-group";
import { getIdFromRequest } from "@/utils/getIdFromRequest";

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

        const groupObjectId = new Types.ObjectId(groupId);

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

        const currUserId = await getIdFromRequest(request);
        const currUserObjectId = new Types.ObjectId(currUserId!);

        const agg = await Group.aggregate([
            {
                $match: {
                    _id: groupObjectId,
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "members",
                    foreignField: "_id",
                    as: "members",
                    pipeline: [
                        {
                            $project: {
                                userId: 1,
                                _id: 0,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    isCurrUserMember: {
                        $in: [currUserObjectId, "$members.userId"],
                    },
                },
            },
        ]).then((res) => res[0]);

        if (!agg.isCurrUserMember) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Permission denied",
                    },
                },
                { status: 403 }
            );
        }

        const group = await Group.aggregate([
            {
                $match: {
                    _id: groupObjectId,
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "members",
                    foreignField: "_id",
                    as: "members",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            username: 1,
                                            avatar: 1,
                                            _id: 0,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$user",
                            },
                        },
                        {
                            $addFields: {
                                joinedAt: "$createdAt",
                                user_id: "$user._id",
                                _id: "$_id",
                            },
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: ["$$ROOT", "$user"],
                                },
                            },
                        },
                        {
                            $project: {
                                createdAt: 0,
                                updatedAt: 0,
                                user: 0,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "admin",
                    foreignField: "_id",
                    as: "admin",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            username: 1,
                                            avatar: 1,
                                            _id: 0,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$user",
                            },
                        },
                        {
                            $addFields: {
                                joinedAt: "$createdAt",
                                _id: "$_id",
                            },
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: ["$$ROOT", "$user"],
                                },
                            },
                        },
                        {
                            $project: {
                                user: 0,
                                createdAt: 0,
                                updatedAt: 0,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            username: 1,
                                            avatar: 1,
                                            userId: "$_id",
                                            _id: 0,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$user",
                            },
                        },
                        {
                            $addFields: {
                                joinedAt: "$createdAt",
                            },
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: ["$$ROOT", "$user"],
                                },
                            },
                        },
                        {
                            $project: {
                                user: 0,
                                createdAt: 0,
                                updatedAt: 0,
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
                $addFields: {
                    members: {
                        $map: {
                            input: "$members",
                            as: "member",
                            in: {
                                $mergeObjects: [
                                    {
                                        isAdmin: {
                                            $in: ["$$member._id", "$admin._id"],
                                        },
                                        isCreator: {
                                            $eq: [
                                                "$$member._id",
                                                "$createdBy._id",
                                            ],
                                        },
                                    },

                                    "$$member",
                                ],
                            },
                        },
                    },
                    currUser: {
                        $filter: {
                            input: "$members",
                            as: "member",
                            cond: {
                                $eq: [currUserObjectId, "$$member.userId"],
                            },
                            limit: 1,
                        },
                    },
                },
            },
            {
                $unwind: {
                    path: "$currUser",
                },
            },
            {
                $addFields: {
                    currUser: {
                        $mergeObjects: [
                            "$currUser",
                            {
                                isAdmin: {
                                    $in: [currUserObjectId, "$admin.userId"],
                                },
                                isCreator: {
                                    $eq: [
                                        currUserObjectId,
                                        "$createdBy.userId",
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        ]);

        return NextResponse.json(
            {
                success: true,
                message: "Group fetched successfully",
                data: group[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("ERROR: ", error);

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
