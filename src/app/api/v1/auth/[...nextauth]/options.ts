import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialProvider({
            name: "credentials-provider",
            type: "credentials",
            credentials: {
                email: {
                    type: "text",
                },
                username: {
                    type: "text",
                },
                password: {
                    type: "password",
                },
            },
            async authorize(credentials, req) {
                if (
                    !credentials?.email ||
                    !credentials?.username ||
                    !credentials?.password
                ) {
                    return null;
                }

                await connectDB();
                const dbUser = await User.findOne({
                    $or: [
                        {
                            username: credentials.username,
                        },
                        {
                            email: credentials.email,
                        },
                    ],
                });

                if (!dbUser) throw new Error("User not found");
                if (!dbUser.isVerified) {
                    throw new Error("User is not verified");
                }

                const passwordMatch = await compare(
                    credentials.password,
                    dbUser?.password
                );

                if (!passwordMatch) {
                    throw new Error("Incorrect password");
                }

                return {
                    _id: dbUser.id,
                    username: dbUser.username,
                    avatar: dbUser.avatar,
                    email: dbUser.email,
                    isVerified: dbUser.isVerified,
                };
            },
        }),
    ],
    callbacks: {
        signIn: ({ user }) => {
            if (user.isVerified === false) {
                // The user has passed the correct credentials but they aren't verified
                return false;
            } else if (user.isVerified === true) {
                return true;
            }

            // handle unexpected behaviour
            return false;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                // happens on authorization succeeds
                token._id = user._id;
                token.username = user.username;
                token.email = user.email;
                token.avatar = user.avatar;
                token.isVerified = user.isVerified;
            }

            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                // happens every time a session is checked
                session._id = token._id;
                session.username = token.username;
                session.email = token.email;
                session.avatar = token.avatar;
                session.isVerified = token.isVerified;
            }

            return session;
        },
        redirect: ({ url, baseUrl }) => {
            // TEST: just for testing purpose, this have no real use case
            console.log("redirect url: ", url);
            console.log("redirect baseUrl: ", baseUrl);
            return baseUrl;
        },
    },
    session: {
        maxAge: 86400, // 1 day
        strategy: "jwt",
    },
    jwt: {
        maxAge: 2592000, // 30 days,
    },
};
