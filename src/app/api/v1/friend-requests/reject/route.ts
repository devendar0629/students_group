import { connectDB } from "@/lib/db.config";
import FriendRequest from "@/models/friend_request.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// endpoint for rejecting friend requests
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

        const friendRequest = await FriendRequest.findById(friendRequestId);

        if (!friendRequest) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "friend request not found",
                    },
                },
                { status: 404 }
            );
        }

        const currUserId = await getIdFromRequest(request);
        const currUser = await User.findById(currUserId);

        const friendRequestSender = await User.findById(friendRequest.sender);

        if (friendRequestSender) {
            await Promise.all([
                User.findByIdAndUpdate(currUser!._id, {
                    $pull: {
                        pendingInvitesAndRequests: friendRequest._id,
                    },
                }),
                User.findByIdAndUpdate(friendRequestSender!._id, {
                    $pull: {
                        pendingInvitesAndRequests: friendRequest._id,
                    },
                }),
            ]);
        } else {
            await User.findByIdAndUpdate(currUser!._id, {
                $pull: {
                    pendingInvitesAndRequests: friendRequest._id,
                },
            });
        }

        await FriendRequest.findByIdAndDelete(friendRequest._id);

        return NextResponse.json(
            {
                success: true,
                message: "Friend request rejected successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error rejecting friend requests: ", error);

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
