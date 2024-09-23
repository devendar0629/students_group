import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// endpoint for removing a user from a group
export async function PATCH(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqData = await request.json();
        const userIdToRemove = reqData.userId;
        const currentUserId = await getIdFromRequest(request);
        const groupId = reqData.groupId;

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
        if (!isValidObjectId(userIdToRemove)) {
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

        if (
            !(await Group.exists({
                _id: groupId,
            }))
        ) {
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

        const groupToRemoveFrom = await Group.findById(groupId);

        // verify if the user to remove is an member of the group
        if (
            !groupToRemoveFrom?.members.includes(
                new Types.ObjectId(userIdToRemove)
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "The user with the user id is not a member of the group",
                    },
                },
                { status: 400 }
            );
        }

        // verify if the remover is an admin of the group
        // this also verifies if the remover is a member in the group
        if (groupToRemoveFrom?.admin.toString() !== currentUserId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        cause: "Permission denied",
                        message: "Cannot perform action",
                    },
                },
                { status: 403 }
            );
        }

        const userToRemove = await User.findById(userIdToRemove).select(
            "-password"
        );

        // remove the group from the user's joined groups list
        userToRemove?.joinedGroups.splice(
            userToRemove.joinedGroups.indexOf(new Types.ObjectId(groupId)),
            1
        );

        // remove the user from group's member list
        groupToRemoveFrom?.members.splice(
            groupToRemoveFrom.members.indexOf(
                new Types.ObjectId(userIdToRemove)
            ),
            1
        );

        await groupToRemoveFrom.save();
        await userToRemove?.save();

        return NextResponse.json(
            {
                success: true,
                message: "User successfully removed from group",
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
