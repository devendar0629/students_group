import { signupSchema } from "@/lib/validationSchemas/signup";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { genSalt, hash } from "bcryptjs";
import { ZodError } from "zod";
import resend from "@/lib/config/resend.config";
import VerificationEmail from "@/../emails/VerificationEmail";
import crypto from "node:crypto";
import Token from "@/models/token.model";

export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    try {
        const data = await request.json();
        const validatedData = signupSchema.parse(data);

        const userAlreadyExists = await User.findOne({
            $or: [
                {
                    email: validatedData.email.trim(),
                },
                {
                    username: validatedData.username.trim(),
                },
            ],
        });

        if (userAlreadyExists?.isVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Username or email already taken",
                    },
                },
                { status: 400 }
            );
        }

        const salt = await genSalt(10);
        const hashedPassword = await hash(validatedData.password, salt);

        const newUser = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            username: validatedData.username,
            password: hashedPassword,
        });

        const verificationCode = crypto.randomInt(100000, 1000000).toString();
        const tokenInstance = await Token.create({
            user: newUser._id.toString(),
            verificationCode,
            verificationCodeExpiry: new Date(Date.now() + 300000), // 5 minutes
        });

        const mailResponse = await resend.emails.send({
            from: "onboarding@resend.dev",
            subject: "Verification code",
            to: newUser.email,
            html: "",
            react: VerificationEmail({
                name: newUser.username ?? newUser.email,
                verificationCode,
            }),
        });

        const responseUser = newUser.toObject();
        delete (responseUser as any).password; // CHECK

        return NextResponse.json(
            {
                success: true,
                message: "User signed up successfully",
                data: { responseUser },
            },
            { status: 201 }
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
