import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongoose";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    return null;
                }

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                await dbConnect();
                let dbUser = await User.findOne({ email: user.email! });
                if (!dbUser) {
                    dbUser = await User.create({
                        email: user.email,
                        name: user.name,
                        // no password for google users
                    });
                }
                // Assign MongoDB _id to the user object that gets passed to JWT callback
                user.id = dbUser._id.toString();
            }
            return true;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                // Persist the user id from the authorize function or signIn callback to the token
                token.id = user.id;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session?.user) {
                // The token now has the id, assign it to the session
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
