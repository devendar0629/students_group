import Group, { GroupMember } from "@/models/group.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: {
        group_id: string;
    };
}

/**
 *
 * @description Enpoint to promote a group member to admin
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    try {
        const reqBody = await request.json();
        const userIdToBePromoted = reqBody.userId;
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

        if (!isValidObjectId(userIdToBePromoted)) {
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

        const currUserId = await getIdFromRequest(request);
        const currUserObjectId = new Types.ObjectId(currUserId!);

        const userToBePromotedObjectId = new Types.ObjectId(userIdToBePromoted);

        // Prevent user from promoting themself
        if (currUserId === userIdToBePromoted) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot promote yourself",
                    },
                },
                { status: 404 }
            );
        }

        const groupAggregation = await Group.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(groupId),
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
                                _id: 1,
                                userId: 1,
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
                            $project: {
                                _id: 1,
                                userId: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    currUser: {
                        $filter: {
                            input: "$members",
                            as: "member",
                            cond: {
                                $eq: ["$$member.userId", currUserObjectId],
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
                        isAdmin: {
                            $in: [currUserObjectId, "$admin.userId"],
                        },
                        isMember: {
                            $in: [currUserObjectId, "$members.userId"],
                        },
                    },
                    userToBePromoted: {
                        isAdmin: {
                            $in: [userToBePromotedObjectId, "$admin.userId"],
                        },
                        isMember: {
                            $in: [userToBePromotedObjectId, "$members.userId"],
                        },
                    },
                },
            },
        ]).then((res) => res[0]);

        if (!groupAggregation) {
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

        // Check if the current user exists in the group
        if (!groupAggregation.currUser.isMember) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "Current user is not a member of group",
                    },
                },
                { status: 403 }
            );
        }

        // Check if the user to be promoted exists in the group
        if (!groupAggregation.userToBePromoted.isMember) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "User is not a member of group",
                    },
                },
                { status: 400 }
            );
        }

        // Check if the current user is a admin of the group
        if (!groupAggregation.currUser.isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "Not an admin of the group",
                    },
                },
                { status: 403 }
            );
        }

        // Check the user to be added is already an admin in that group
        if (groupAggregation.userToBePromoted.isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User is already an admin",
                    },
                },
                { status: 400 }
            );
        }

        const userToBePromotedGroupMember = await GroupMember.findOne({
            userId: userIdToBePromoted,
        });

        await Group.findByIdAndUpdate(groupId, {
            $push: {
                admin: userToBePromotedGroupMember!._id,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "User promoted to admin successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error promoting admin: ", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong while removing the user from group",
                },
            },
            { status: 500 }
        );
    }
}
