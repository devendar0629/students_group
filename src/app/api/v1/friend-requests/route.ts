import { connectDB } from "@/lib/db.config";
import FriendRequest from "@/models/friend_request.model";
import User from "@/models/user.model";
import UserPreferences from "@/models/user_preferences.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// endpoint for fetching a user's friend requests
export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const currentUserId = await getIdFromRequest(request);
        const userId = currentUserId;

        if (!isValidObjectId(userId)) {
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
            !(await User.exists({
                _id: userId,
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

        const pendingFriendRequests = await FriendRequest.aggregate([
            {
                $match: {
                    $or: [
                        {
                            sender: new Types.ObjectId(userId!),
                        },
                        {
                            receiver: new Types.ObjectId(userId!),
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiver",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$receiver",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$sender",
                },
            },
        ]);

        return NextResponse.json(
            {
                success: true,
                data: pendingFriendRequests,
                message: "Pending friend requests fetched successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong while fetching pending friend requests for the user",
                },
            },
            { status: 500 }
        );
    }
}

// endpoint for sending a friend request
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
        }).select("-password");

        // verify if they're sending the request to themself
        if (receiverObject?._id.toString() === senderId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Cannot send request to yourself",
                    },
                },
                { status: 400 }
            );
        }

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

        const receiverPreferences = await UserPreferences.findOne({
            user: receiverObject._id,
        });

        if (!receiverPreferences?.acceptFriendRequestsFromAnyone) {
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

        // verify if they're already friends
        if (
            receiverObject.friends.some(
                (friendId) => friendId.toString() === senderId
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "You are already friends",
                    },
                },
                { status: 400 }
            );
        }

        let senderObject = await User.findById(senderId).populate(
            "pendingInvitesAndRequests"
        );

        // check if request is already sent
        const isAlreadyAdded = senderObject?.pendingInvitesAndRequests.some(
            (friendRequest: any) => {
                return friendRequest.sender.toString() === senderId;
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
