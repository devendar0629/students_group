import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { signinSchema } from "@/lib/validationSchemas/signin";

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
                const validatedCredentials =
                    signinSchema.safeParse(credentials);

                if (!validatedCredentials.success) {
                    throw new Error("Invalid request payload");
                }

                await connectDB();
                const dbUser = await User.findOne({
                    $or: [
                        {
                            username:
                                validatedCredentials.data.username_or_email,
                        },
                        {
                            email: validatedCredentials.data.username_or_email,
                        },
                    ],
                });

                if (!dbUser) throw new Error("Incorrect credentials");
                if (!dbUser.isVerified) {
                    throw new Error("User email is not verified");
                }

                const passwordMatch = await compare(
                    validatedCredentials.data.password,
                    dbUser.password
                );

                if (!passwordMatch) {
                    throw new Error("Incorrect credentials");
                }

                return {
                    _id: dbUser._id,
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
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.email = token.email;
                session.user.avatar = token.avatar;
                session.user.isVerified = token.isVerified;
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
    pages: {
        signIn: "/signin",
    },
};
