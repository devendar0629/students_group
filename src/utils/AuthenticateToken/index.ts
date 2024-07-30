import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { decode, getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function authenticateRequest(request: NextRequest) {
    await connectDB();
    try {
        const cookieToken = await getToken({
            req: request,
        });

        if (!cookieToken) {
            return false;
        }

        const userId = cookieToken._id;

        if (
            !(await User.exists({
                _id: userId,
            }))
        ) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

export async function authenticateToken(token: string | null | undefined) {
    await connectDB();
    try {
        if (!token?.trim()) return false;

        const decodedToken = await decode({
            secret: process.env.NEXTAUTH_SECRET!,
            token,
        });

        if (!decodedToken) return false;

        const userId = decodedToken._id;

        if (
            !(await User.exists({
                _id: userId,
            }))
        )
            return false;

        return true;
    } catch (error) {
        return false;
    }
}
