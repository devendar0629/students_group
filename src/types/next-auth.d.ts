import type { Types } from "mongoose";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

interface AuthUser {
    _id: string | Types.ObjectId;
    username: string;
    avatar?: string;
    isVerified: boolean;
}

declare module "next-auth" {
    interface User extends AuthUser {
        id?: string; // make the default next-auth id optional
        email: string; // make the default next-auth email required
    }

    interface Session {
        user: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends User {
        email: string; // for some reason even though we've extended User with AuthUser, the email property was still optional.
    }
}
