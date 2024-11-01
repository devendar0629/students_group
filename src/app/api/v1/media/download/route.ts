import { NextRequest, NextResponse } from "next/server";

function isValidUrl(url: string) {
    try {
        const parsedUrl = new URL(url);
        return (
            parsedUrl.hostname === "res.cloudinary.com" &&
            parsedUrl.pathname.startsWith(
                `/${process.env.CLOUDINARY_CLOUD_NAME}`
            )
        );
    } catch (error) {
        return false;
    }
}

function getFilenameFromUrl(url: string) {
    return url.length ? url.slice(url.lastIndexOf("/") + 1) : null;
}

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    try {
        const { searchParams } = new URL(request.url);
        const url = decodeURIComponent(searchParams.get("url") ?? "");
        const filenameFromRequest = searchParams.get("filename");

        if (!url || !isValidUrl(url)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid url",
                    },
                },
                { status: 400 }
            );
        }

        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Error downloading file",
                    },
                },
                { status: response.status }
            );
        }

        const filename =
            filenameFromRequest || getFilenameFromUrl(url) || "downloaded_file";

        const headers = new Headers();
        headers.set(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        headers.set("Content-Type", response.headers.get("content-type") || "");

        return new NextResponse(response.body, { headers });
    } catch (error) {
        console.error("Download error:", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while downloading the file",
                },
            },
            { status: 500 }
        );
    }
}
