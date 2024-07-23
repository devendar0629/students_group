import { updateProfileSchema } from "@/lib/validationSchemas/update-profile";
import User from "@/models/user.model";
import uploadService from "@/services/cloudinary.service";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { uploadFileToDisk } from "@/utils/uploadFileToDisk";
import { unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ZodError } from "zod";

export async function PATCH(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    try {
        const formData = await request.formData();
        const formDataAsObject = Object.fromEntries(formData.entries());
        const userId = await getIdFromRequest(request);
        const avatarFile = formData.get("avatar") as File | null;

        const validatedData = updateProfileSchema.parse(formDataAsObject);
        delete validatedData.avatar; // remove to update db directly but still getting it validated

        let updatedUser = await User.findByIdAndUpdate(userId, validatedData, {
            new: true,
        }).select("-password"); // update all details except avatar, we'll do that manually

        if (!updatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "Something went wrong while updating user details",
                    },
                },
                { status: 500 }
            );
        }

        if (
            avatarFile &&
            avatarFile.size > 0 &&
            avatarFile.type !== "application/octet-stream"
        ) {
            const randomNumber =
                Math.floor(Math.random() * (999999998 - 100000001 + 1)) +
                100000001;
            const expectedLocalPathToFile = path.join(
                process.cwd(),
                "uploads/temp",
                randomNumber + "--" + avatarFile.name
            );

            // upload to disk temporarily
            await uploadFileToDisk(avatarFile, expectedLocalPathToFile);
            const avatarUploadResponse = await uploadService.uploadImage(
                expectedLocalPathToFile,
                {
                    folder: "users/avatar",
                }
            );

            updatedUser.avatar = avatarUploadResponse.secure_url;
            updatedUser = await updatedUser.save();

            // unlink the temporary upload
            await unlink(expectedLocalPathToFile);
        }

        return NextResponse.json(
            {
                success: true,
                message: "User details updated successfully",
                data: updatedUser,
            },
            { status: 200 }
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
                    message: "Something went wrong while updating user details",
                },
            },
            { status: 500 }
        );
    }
}
