import { connectDB } from "@/lib/db.config";
import FriendRequest from "@/models/friend_request.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqBody = await request.json();
        const senderId = await getIdFromRequest(request);

        const receiverUsername = reqBody.username;
        const receiverObject = await User.findOne({
            username: receiverUsername,
        });

        // Does the receiver exist in database ?
        if (!receiverObject) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User doesn't exist",
                    },
                },
                { status: 404 }
            );
        }

        let senderObject = await User.findById(senderId).populate(
            "pendingInvitesAndRequests"
        );

        if (senderObject?._id.toString() === receiverObject._id.toString()) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot add yourself as friend",
                    },
                },
                { status: 400 }
            );
        }

        // check if request is already sent
        const isAlreadyAdded = senderObject?.pendingInvitesAndRequests.some(
            (friendRequest: any) => {
                return (
                    friendRequest.receiver.toString() ===
                    receiverObject._id.toString()
                );
            }
        );

        if (isAlreadyAdded) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Friend request already sent",
                    },
                },
                { status: 400 }
            );
        }

        // check if the user has an pending request to the username that they're trying to send friend request to
        const isAlreadyHaveUnacceptedRequestWithThisUsername =
            senderObject?.pendingInvitesAndRequests.some(
                (friendRequest: any) => {
                    return (
                        friendRequest.sender.toString() ===
                        receiverObject._id.toString()
                    );
                }
            );

        if (isAlreadyHaveUnacceptedRequestWithThisUsername) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "There is a pending request with this username",
                    },
                },
                { status: 400 }
            );
        }

        const friendRequestObject = await FriendRequest.create({
            sender: senderId,
            receiver: receiverObject._id,
        });

        receiverObject.pendingInvitesAndRequests.push(friendRequestObject._id);
        senderObject?.pendingInvitesAndRequests.push(friendRequestObject._id);

        await receiverObject.save();
        await senderObject?.save();

        return NextResponse.json(
            {
                success: true,
                message: "Friend request sent successfully",
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
                        "Something went wrong while sending friend request",
                },
            },
            { status: 500 }
        );
    }
}
