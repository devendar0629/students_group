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
 * @description Enpoint to demote a group member from admin
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    try {
        const reqBody = await request.json();
        const userIdToBeDemoted = reqBody.userId;
        const userToBeDemotedObjectId = new Types.ObjectId(userIdToBeDemoted);
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

        if (!isValidObjectId(userIdToBeDemoted)) {
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

        // Prevent user from demoting themself
        if (currUserId === userIdToBeDemoted) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot demote yourself",
                    },
                },
                { status: 400 }
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
                    userToBeDemoted: {
                        isAdmin: {
                            $in: [userToBeDemotedObjectId, "$admin.userId"],
                        },
                        isMember: {
                            $in: [userToBeDemotedObjectId, "$members.userId"],
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
                { status: 400 }
            );
        }

        // Check if the user to be demoted exists in the group
        if (!groupAggregation.userToBeDemoted.isMember) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User is not a group member",
                    },
                },
                { status: 400 }
            );
        }

        if (!groupAggregation.userToBeDemoted.isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User is not an admin",
                    },
                },
                { status: 400 }
            );
        }

        // Check if the current user is creator of the group
        // Only creator can demote admins
        if (!groupAggregation.currUser.isCreator) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "Permission denied",
                    },
                },
                { status: 403 }
            );
        }

        const userToBeDemotedGroupMember = await GroupMember.findOne({
            userId: userIdToBeDemoted,
        });

        await Group.findByIdAndUpdate(groupId, {
            $pull: {
                admin: userToBeDemotedGroupMember!._id,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "User demoted to admin successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error demoting from admin: ", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while demoting the user",
                },
            },
            { status: 500 }
        );
    }
}
