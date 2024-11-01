import { signupSchema } from "@/lib/validationSchemas/signup";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { genSalt, hash } from "bcryptjs";
import { ZodError } from "zod";
import resend from "@/lib/config/resend.config";
import VerificationEmail from "@/../emails/VerificationEmail";
import { randomInt as cryptoRandomInt } from "node:crypto";
import Token from "@/models/token.model";
import { connectDB } from "@/lib/db.config";
import UserPreferences from "@/models/user_preferences.model";

export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const data = await request.json();
        const validatedData = signupSchema.parse(data);

        const verifiedUserAlreadyExists = await User.findOne({
            $and: [
                {
                    $or: [
                        {
                            email: validatedData.email.trim(),
                        },
                        {
                            username: validatedData.username.trim(),
                        },
                    ],
                },
                {
                    isVerified: true,
                },
            ],
        });

        if (verifiedUserAlreadyExists) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Username (and/or) email already taken",
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

        const verificationCode = cryptoRandomInt(100000, 1000000).toString();
        await Token.create({
            user: newUser._id,
            verificationCode,
            verificationCodeExpiry: new Date(Date.now() + 300000), // 5 minutes
        });

        const userPreferencesInstance = await UserPreferences.create({
            user: newUser._id,
        });

        await newUser.save();
        await userPreferencesInstance.save();

        if (process.env.SENDER_MAIL) {
            await resend.emails.send({
                from: process.env.SENDER_MAIL,
                subject: "Verification code",
                to: newUser.email,
                html: "",
                react: VerificationEmail({
                    name: newUser.name,
                    verificationCode,
                    user_id: newUser._id.toString(),
                }),
            });
        } else {
            console.error("⚠️ Define the SENDER_MAIL in environment variables");
        }

        const responseUser = newUser.toObject();

        delete (responseUser as any).password;

        return NextResponse.json(
            {
                success: true,
                message: "User signed up successfully",
                data: { user: responseUser },
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
