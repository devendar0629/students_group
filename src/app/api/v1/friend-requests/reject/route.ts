import FriendRequest from "@/models/friend_request.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// endpoint for rejecting friend requests
export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
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

        await friendRequestObject?.deleteOne();

        await currentUserObject!.save();
        await otherUserObject.save();

        return NextResponse.json(
            {
                success: true,
                message: "Friend request rejected successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong while rejecting the friend request",
                },
            },
            { status: 500 }
        );
    }
}
