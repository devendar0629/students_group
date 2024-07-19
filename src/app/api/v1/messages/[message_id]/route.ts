import { connectDB } from "@/lib/db.config";
import Message from "@/models/message.model";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: {
        message_id: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const message_id = params.message_id;

        if (!isValidObjectId(message_id)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid message id",
                    },
                },
                { status: 400 }
            );
        }

        const message = await Message.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(message_id),
                },
            },
            {
                $lookup: {
                    from: "media",
                    foreignField: "_id",
                    localField: "mediaFile",
                    as: "mediaFile",
                    pipeline: [
                        {
                            $project: {
                                sender: 0,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$mediaFile",
                },
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "sender",
                    as: "sender",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                username: 1,
                                avatar: 1,
                                gender: 1,
                                dateOfBirth: 1,
                                bio: 1,
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

        if (!message || !message.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Message not found",
                    },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Message fetched successfully",
            data: message[0],
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while fetching the message",
                },
            },
            { status: 500 }
        );
    }
}
