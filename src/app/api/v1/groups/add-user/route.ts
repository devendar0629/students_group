import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import User from "@/models/user.model";
import UserPreferences from "@/models/user_preferences.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to add a user to a group
export async function PATCH(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqData = await request.json();
        const groupId = reqData.groupId;
        const userIdToAdd = reqData.userId;

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

        if (!isValidObjectId(userIdToAdd)) {
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

        // verify if the user to add exists
        if (
            !(await User.exists({
                _id: userIdToAdd,
            }))
        )
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User not found",
                    },
                },
                { status: 404 }
            );

        if (
            !(await Group.exists({
                _id: groupId,
            }))
        )
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Group not found",
                    },
                },
                { status: 404 }
            );

        const userToAdd = await User.findById(userIdToAdd).select("-password");
        const groupObject = await Group.findById(groupId);

        const currentUserId = await getIdFromRequest(request);
        const currentUserObject = await User.findById(currentUserId).select(
            "-password"
        );

        // verify adder and the user that wants to be added are different
        if (currentUserId === userIdToAdd) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot add yourself to a group",
                    },
                },
                { status: 404 }
            );
        }

        const isAdderInGroup = groupObject?.members.includes(
            new Types.ObjectId(currentUserId as Types.ObjectId)
        );

        // verify adder is in the group before adding some other person
        if (!isAdderInGroup) {
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

        const userToBeAddedPreferences = await UserPreferences.findOne({
            user: userIdToAdd,
        });

        // verify even if they allow such requests from FRIENDS only, so we can verify
        if (userToBeAddedPreferences?.acceptGroupInvitesFrom === "FRIENDS") {
            // verify if they're friends
            const isFriend = userToAdd?.friends.includes(
                new Types.ObjectId(currentUserId!)
            );

            if (!isFriend) {
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
        }

        const isAlreadyMember = userToAdd?.joinedGroups.includes(
            new Types.ObjectId(groupId)
        );

        // Check if the user is already in group
        if (isAlreadyMember) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User is already a member",
                    },
                },
                { status: 400 }
            );
        }

        // add the group id to the user's joined groups list
        userToAdd?.joinedGroups.push(groupId);

        // add the user to the group's member list
        groupObject?.members.push(userIdToAdd);

        await groupObject?.save();
        await userToAdd?.save();

        return NextResponse.json(
            {
                success: true,
                message: "User added to group successfully",
            },
            { status: 200 }
        );
    } catch (error) {
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
    }
}
