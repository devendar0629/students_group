import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import User from "@/models/user.model";
import UserPreferences from "@/models/user_preferences.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isGroupAdmin, isGroupMember } from "@/utils/group";
import { isValidObjectId, Types } from "mongoose";
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
    await connectDB();
    try {
        const reqData = await request.json();
        const usernameToBeAdded = reqData.username;

        if (!usernameToBeAdded?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid username",
                    },
                },
                { status: 400 }
            );
        }

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

        const currUserId = await getIdFromRequest(request);
        const userToBeAdded = await User.findOne({
            username: usernameToBeAdded,
        }).select("-password");

        // Check if the user to be added exist
        if (!userToBeAdded) {
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

        const userIdToBeAdded = userToBeAdded._id.toString();

        // Cannot add yourself to group
        if (userIdToBeAdded === currUserId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot add yourself to group",
                    },
                },
                { status: 400 }
            );
        }

        const userToBeAddedPreferences = await UserPreferences.findOne({
            user: userIdToBeAdded,
        });

        const isAdderFriend = userToBeAdded.friends.some(
            (friend) => friend._id.toString() === currUserId
        );

        if (
            userToBeAddedPreferences?.acceptGroupInvitesFrom === "FRIENDS" &&
            !isAdderFriend
        ) {
            // Return error , if the adder is not a friend
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action",
                        reason: "Permission denied",
                    },
                },
                { status: 400 }
            );
        }

        // Check the user to be added is a member of group
        // They shouldn't be a group member
        if (isGroupMember(group, userIdToBeAdded)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User is already a member of the group",
                    },
                },
                { status: 400 }
            );
        }

        // Check if the current user is a member of group
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

        userToBeAdded.joinedGroups.push(new Types.ObjectId(groupId));
        group.members.push(new Types.ObjectId(userIdToBeAdded));

        await Promise.all([userToBeAdded.save(), group.save()]).catch((err) => {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "Something went wrong while adding the user to group",
                    },
                },
                { status: 500 }
            );
        });

        return NextResponse.json(
            {
                success: true,
                error: {
                    message: "User added to group successfully",
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);

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
