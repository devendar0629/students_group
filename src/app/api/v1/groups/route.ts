import { connectDB } from "@/lib/db.config";
import { createGroupSchema } from "@/lib/validationSchemas/create-group";
import Group from "@/models/group.model";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

// endpoint for creating group
export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const data = await request.json();
        const token = await getToken({
            req: request,
        });

        const validatedData = createGroupSchema.parse(data);

        if (validatedData.members && validatedData.members.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Group members count should atleast be 1",
                    },
                },
                { status: 400 }
            );
        }

        if (validatedData.members) {
            validatedData.members.push(token!._id.toString());
        }

        const newGroup = await Group.create({
            name: validatedData.name,
            description: validatedData.description,
            admin: token?._id,
            createdBy: token?._id,
            members: validatedData.members,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Group created successfully",
                data: {
                    group: newGroup,
                },
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
                    message: "Something went wrong, while creating the group",
                },
            },
            { status: 500 }
        );
    }
}
