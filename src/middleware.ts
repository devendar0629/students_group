import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    // authentication logic
    if (!token) {
        return NextResponse.redirect(
            new URL("/signin", request.nextUrl.origin)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!verify|signin|signup|_next/static|_next/image|favicon.ico){1})",
    ],
};
