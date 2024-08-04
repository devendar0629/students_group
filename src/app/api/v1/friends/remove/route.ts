import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqData = await request.json();

        const userIdToRemove = reqData.userId;

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
            !(await User.exists({
                _id: userIdToRemove,
            }))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User not found",
                    },
                },
                { status: 400 }
            );
        }

        const currentUserId = await getIdFromRequest(request);
        const currentUser = await User.findById(currentUserId);

        // check if the user is a friend
        if (
            !currentUser?.friends.includes(new Types.ObjectId(userIdToRemove))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "The user is not a friend",
                    },
                },
                { status: 400 }
            );
        }

        const userToRemove = await User.findById(userIdToRemove);

        currentUser.friends.splice(
            currentUser.friends.indexOf(new Types.ObjectId(userIdToRemove)),
            1
        );
        userToRemove?.friends.splice(
            userToRemove.friends.indexOf(new Types.ObjectId(currentUserId!)),
            1
        );

        await currentUser.save();
        await userToRemove?.save();

        return NextResponse.json(
            {
                success: false,
                message: "Friend removed successfully",
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
