import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isGroupMember, isGroupAdmin } from "@/utils/group";
import Group from "@/models/group.model";
import User from "@/models/user.model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: {
        group_id: string;
    };
}

export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
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

        // Check if the group exist
        const group = await Group.findById(groupId);
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

        // Check if the user to be added exist
        const userToBeRemoved = await User.findById(userIdToBeRemoved);
        if (!userToBeRemoved) {
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

        // Check the user to be added is not a member of group
        // They should be a group member in order to be removed
        if (!isGroupMember(group, userIdToBeRemoved)) {
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

        // Check if the current user is a member of group
        const currUserId = await getIdFromRequest(request);
        if (!isGroupMember(group, currUserId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        cause: "Not a group member",
                    },
                },
                { status: 403 }
            );
        }

        // Check if the current user is a admin of group
        if (!isGroupAdmin(group, currUserId)) {
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

        let index = -1;
        const groupMembersCount = group.members.length;

        for (let i = 0; i < groupMembersCount; i++) {
            if (group.members[i]._id.toString() === userIdToBeRemoved) {
                index = i;
                break;
            }
        }

        // remove from group's member list
        group.members.splice(index, 1);

        index = -1;
        const removingUserJoinedGroupsCount =
            userToBeRemoved.joinedGroups.length;

        for (let i = 0; i < removingUserJoinedGroupsCount; i++) {
            if (userToBeRemoved.joinedGroups[i]._id.toString() === groupId) {
                index = i;
                break;
            }
        }

        // remove the group from user's joined groups list
        userToBeRemoved.joinedGroups.splice(index, 1);

        await userToBeRemoved.save();
        await group.save();

        return NextResponse.json(
            {
                success: true,
                error: {
                    message: "User removed from group successfully",
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("⚠️ Error; ", error);

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
