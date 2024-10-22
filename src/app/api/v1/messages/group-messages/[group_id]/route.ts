import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ZodError } from "zod";
import fs from "fs/promises";
import Message from "@/models/message.model";
import { sendMessageInGroupSchema } from "@/lib/validationSchemas/send-message";
import Media from "@/models/media.model";
import uploaderService from "@/services/cloudinary.service";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db.config";
import Group from "@/models/group.model";
import { isValidObjectId, Types } from "mongoose";
import { uploadFileToDisk } from "@/utils/uploadFileToDisk";

interface RouteParams {
    params: {
        group_id: string;
    };
}

// Send a message in a given group
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const group_id = params.group_id;

        const formData = await request.formData();
        const userToken = await getToken({
            req: request,
        });

        const mediaFile = formData.get("mediaFile");
        const content = formData.get("content");
        const sender = userToken?._id;

        // DATA VALIDATION
        let validatedData = sendMessageInGroupSchema.parse({
            sender,
            content,
            group_id,
            mediaFile,
        });

        const group = await Group.findById(validatedData.group_id);
        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: "Group not found" },
                },
                { status: 404 }
            );
        }

        let newMessage = new Message({
            sender: userToken?._id,
            content: validatedData.content,
        });

        // File upload logic
        if (
            validatedData.mediaFile &&
            validatedData.mediaFile !== "undefined"
        ) {
            const file = validatedData.mediaFile as File;

            const randomNumber =
                Math.floor(Math.random() * (999999998 - 100000001 + 1)) +
                100000001;
            const uniqueFileName = randomNumber + "--" + file.name;

            const expectedLocalPathToFile = path.join(
                process.cwd(),
                "uploads/temp",
                uniqueFileName
            );

            await uploadFileToDisk(file, expectedLocalPathToFile);

            const uploadResponse = await uploaderService.uploadAny(
                expectedLocalPathToFile,
                {
                    folder: "posts/media",
                    resource_type: "auto",
                    public_id: uniqueFileName,
                }
            );

            await fs.unlink(expectedLocalPathToFile);

            const newMedia = new Media({
                fileName: randomNumber + file.name,
                link: uploadResponse.secure_url,
                sender: userToken?._id,
            });

            await newMedia.save();
            newMessage.mediaFile = newMedia._id;
        }

        // Save the sent message
        let savedMessage = await newMessage.save();

        // Populate the mediaFile
        if (validatedData.mediaFile) {
            savedMessage = await savedMessage.populate("mediaFile");
        }

        // Push the new message into the group's messages
        group.messages.push(savedMessage._id);
        await group.save();

        return NextResponse.json(
            {
                success: true,
                message: "Message sent successfully",
                data: savedMessage,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid request payload",
                    },
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong, while sending the message",
                },
            },
            { status: 500 }
        );
    }
}

// Fetch all messages of a group
export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const group_id = params.group_id;

        let searchParams = new URL(request.url).searchParams;

        let pageNumber = Number(searchParams.get("page") || 1);
        let limit = Number(searchParams.get("limit") || 25);

        if (pageNumber < 0) pageNumber = 1;
        if (limit < 0) limit = 1;

        if (!isValidObjectId(group_id)) {
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

        if (
            !(await Group.exists({
                _id: group_id,
            }))
        ) {
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

        const group_messages = await Group.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(group_id),
                },
            },
            {
                $lookup: {
                    from: "messages",
                    foreignField: "_id",
                    localField: "messages",
                    as: "messages",
                    pipeline: [
                        {
                            $sort: {
                                createdAt: -1,
                            },
                        },
                        {
                            $lookup: {
                                from: "media",
                                localField: "mediaFile",
                                foreignField: "_id",
                                as: "mediaFile",
                            },
                        },
                        {
                            $unwind: {
                                path: "$mediaFile",
                                preserveNullAndEmptyArrays: true,
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
                                            avatar: 1,
                                            username: 1,
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
                        {
                            $skip: (pageNumber - 1) * limit,
                        },
                        {
                            $limit: limit,
                        },
                    ],
                },
            },
            {
                $project: {
                    messages: 1,
                },
            },
        ]);

        group_messages[0]?.messages?.reverse();

        return NextResponse.json(
            {
                success: true,
                message: "Group messages fetched successfully",
                data: group_messages[0],
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        "Something went wrong, while fetching the group's messages",
                },
            },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
