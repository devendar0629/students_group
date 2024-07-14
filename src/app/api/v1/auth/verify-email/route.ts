import { connectDB } from "@/lib/db.config";
import { verifyEmailSchema } from "@/lib/validationSchemas/verify-email";
import Token from "@/models/token.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const data = await request.json();
        const validatedData = verifyEmailSchema.parse(data);

        const userData = await User.findOne({
            _id: validatedData.user_id,
        }).select("-password");

        if (!userData) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Username doesn't exist",
                    },
                },
                { status: 404 }
            );
        }
        if (userData.isVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "User is already verified",
                    },
                },
                { status: 400 }
            );
        }

        const userToken = await Token.findOne({
            user: userData._id.toString(),
        });

        if (!userToken) {
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

        // check verification code is correct
        if (userToken.verificationCode !== validatedData.verificationCode) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Incorrect verification code",
                    },
                },
                { status: 400 }
            );
        }
        // check for code expiration
        if (userToken.verificationCodeExpiry!?.getTime() < Date.now()) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message:
                            "Verification code expired, try signing up again",
                    },
                },
                { status: 400 }
            );
        }

        userData.isVerified = true;
        await userData.save();

        userToken.verificationCode = undefined;
        userToken.verificationCodeExpiry = undefined;
        await userToken.save();

        return NextResponse.json(
            {
                success: true,
                message: "User email verified successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Incorrect request payload",
                    },
                },
                { status: 400 }
            );
        }

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
