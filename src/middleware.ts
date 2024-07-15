import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
    });

    const publicRouteRegex = /^\/(verify|signin|signup)/;
    const isPublicRoute = publicRouteRegex.test(request.nextUrl.pathname);

    if (!isPublicRoute && !token) {
        return NextResponse.redirect(
            new URL("/signin", request.nextUrl.origin)
        );
    } else if (isPublicRoute && token) {
        return NextResponse.redirect(new URL("/", request.nextUrl.origin));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
