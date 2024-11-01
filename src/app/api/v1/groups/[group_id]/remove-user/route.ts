import { getIdFromRequest } from "@/utils/getIdFromRequest";
import Group, { GroupMember } from "@/models/group.model";
import User from "@/models/user.model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db.config";

interface RouteParams {
    params: {
        group_id: string;
    };
}
/**
 *
 * @description Removes a user from the group
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqData = await request.json();
        const userIdToBeRemoved = reqData.userId;
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

        if (!isValidObjectId(userIdToBeRemoved)) {
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

        const userToBeRemovedObjectId = new Types.ObjectId(userIdToBeRemoved);

        // The user cannot remove themself
        if (userIdToBeRemoved === currUserId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot remove yourself",
                    },
                },
                { status: 400 }
            );
        }

        // Check if the user to be removed exist
        if (
            !(await User.exists({
                _id: currUserId,
            }))
        ) {
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
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "admin",
                    foreignField: "_id",
                    as: "admin",
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                },
            },
            {
                $unwind: {
                    path: "$createdBy",
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
                        isCreator: {
                            $eq: [currUserObjectId, "$createdBy.userId"],
                        },
                    },
                    userToBeRemoved: {
                        isAdmin: {
                            $in: [userToBeRemovedObjectId, "$admin.userId"],
                        },
                        isMember: {
                            $in: [userToBeRemovedObjectId, "$members.userId"],
                        },
                        isCreator: {
                            $eq: [userToBeRemovedObjectId, "$createdBy.userId"],
                        },
                    },
                },
            },
        ]).then((res) => res[0]);

        // Check if the group exist
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

        // Check if the user to be removed is a group member
        if (!groupAggregation.userToBeRemoved.isMember) {
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

        // Cannot remove the group creator
        if (groupAggregation.userToBeRemoved.isCreator) {
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

        // Check if the current user is a admin of group
        if (!groupAggregation.currUser.isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "Not a group admin",
                    },
                },
                { status: 403 }
            );
        }

        // Only creators can remove admin
        if (
            groupAggregation.userToBeRemoved.isAdmin &&
            !groupAggregation.currUser.isCreator
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "Not a group creator",
                    },
                },
                { status: 403 }
            );
        }

        const userToBeRemovedGroupMemberObject = await GroupMember.findOne({
            userId: userIdToBeRemoved,
        });

        if (groupAggregation.userToBeRemoved.isAdmin) {
            await Promise.all([
                Group.findByIdAndUpdate(groupId, {
                    $pull: {
                        admin: userToBeRemovedGroupMemberObject!._id,
                        members: userToBeRemovedGroupMemberObject!._id,
                    },
                }),
                User.findByIdAndUpdate(userIdToBeRemoved, {
                    $pull: {
                        joinedGroups: groupId,
                    },
                }),
                GroupMember.findByIdAndDelete(
                    userToBeRemovedGroupMemberObject!._id
                ),
            ]);
        } else {
            await Promise.all([
                Group.findByIdAndUpdate(groupId, {
                    $pull: {
                        members: userToBeRemovedGroupMemberObject?._id,
                    },
                }),
                User.findByIdAndUpdate(userIdToBeRemoved, {
                    $pull: {
                        joinedGroups: groupId,
                    },
                }),
                GroupMember.findByIdAndDelete(
                    userToBeRemovedGroupMemberObject!._id
                ),
            ]);
        }

        return NextResponse.json(
            {
                success: true,
                message: "User removed from group successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("User remove Error: ", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while add the user to group",
                },
            },
            { status: 500 }
        );
    }
}
