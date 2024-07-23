import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";

export const getIdFromRequest = async (request: NextRequest) => {
    try {
        const userToken = await getToken({
            req: request,
        });

        return userToken?._id;
    } catch (error) {
        return null;
    }
};
