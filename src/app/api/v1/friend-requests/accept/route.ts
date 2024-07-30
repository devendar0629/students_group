import { connectDB } from "@/lib/db.config";
import FriendRequest from "@/models/friend_request.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqData = await request.json();

        const friendRequestId = reqData.friendRequestId;

        if (!isValidObjectId(friendRequestId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid friend request id",
                    },
                },
                { status: 400 }
            );
        }

        if (!(await FriendRequest.exists({ _id: friendRequestId }))) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Friend request doesn't exist",
                    },
                },
                { status: 500 }
            );
        }

        const friendRequestObject = await FriendRequest.findById(
            friendRequestId
        );
        const currentUserId = await getIdFromRequest(request);
        const currentUserObject = await User.findById(currentUserId);

        // The user can only accept friend requests where he is the receiver
        if (
            friendRequestObject?.receiver?._id.toString() !==
            currentUserObject?._id.toString()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot perform action: Permission denied",
                    },
                },
                { status: 403 }
            );
        }

        const otherUserObject = await User.findById(
            friendRequestObject?.receiver
        );

        if (!otherUserObject) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "The user doesn't exist",
                    },
                },
                { status: 400 }
            );
        }

        // remove the friend request objects from their pending list
        currentUserObject?.pendingInvitesAndRequests.splice(
            currentUserObject.pendingInvitesAndRequests.indexOf(
                friendRequestId
            ),
            1
        );
        otherUserObject?.pendingInvitesAndRequests.splice(
            otherUserObject.pendingInvitesAndRequests.indexOf(friendRequestId),
            1
        );

        currentUserObject?.friends.push(otherUserObject._id);
        otherUserObject.friends.push(currentUserObject!._id);

        await friendRequestObject?.deleteOne();

        await currentUserObject!.save();
        await otherUserObject.save();

        return NextResponse.json(
            {
                success: true,
                message: "Friend request accepted successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong while accepting the friend request",
                },
            },
            { status: 500 }
        );
    }
}
