import { connectDB } from "@/lib/db.config";
import { createGroupSchema } from "@/lib/validationSchemas/create-group";
import Group from "@/models/group.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { GroupMember } from "@/models/group.model";

// Endpoint for creating a new group
export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const reqBody = await request.json();
        const validatedData = createGroupSchema.parse(reqBody);

        const currUserId = await getIdFromRequest(request);

        const currUserObject = await GroupMember.create({
            userId: currUserId,
        });

        const groupMemberObjectIds = await Promise.all(
            validatedData.members.map((memberId) =>
                GroupMember.create({
                    userId: memberId,
                })
            )
        ).then((memberObjects) =>
            memberObjects.map((memberObject) => memberObject._id)
        );

        groupMemberObjectIds.splice(0, 0, currUserObject._id);

        const newGroupObject = await Group.create({
            name: validatedData.name,
            description: validatedData.description,
            admin: [currUserObject._id],
            members: groupMemberObjectIds,
            createdBy: currUserObject._id,
        });
        const newGroupObjectId = newGroupObject._id;

        // Add to the joined groups list of every user
        await Promise.all([
            ...validatedData.members.map((memberId) =>
                User.findByIdAndUpdate(memberId, {
                    $push: {
                        joinedGroups: newGroupObjectId,
                    },
                })
            ),
            User.findByIdAndUpdate(currUserId, {
                $push: {
                    joinedGroups: newGroupObjectId,
                },
            }),
        ]);

        return NextResponse.json(
            {
                success: true,
                message: "Group created successfully",
                data: newGroupObject,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating group: ", error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid payload",
                    },
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while creating the group",
                },
            },
            { status: 500 }
        );
    }
}
