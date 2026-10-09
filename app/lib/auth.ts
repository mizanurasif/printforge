
import  { NextAuthOptions } from "next-auth"
import  CredentialsProvider  from "next-auth/providers/credentials"
import { getUserByEmail } from "./user";
import bcrypt from "bcryptjs";

export const authOptions:NextAuthOptions = {
    providers:[
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", },
                password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
            if(!credentials?.email || !credentials.password){
                throw new Error("Missing email or password");
            }

            try
            {
                const user = getUserByEmail(credentials.email)
                if(!user)
                {
                    throw new Error('No user found');
                }
                const isValid = await bcrypt.compare(credentials.password,user.passwordHash)
                if(!isValid)
                {
                    throw new Error('Invalid User');
                }
                return{
                    id: String(user.id),
                    email: user.email,
                    name: user.name
                }
            } catch(error) {
                throw error
            }

        }
        })
    ],
    callbacks: {
        async jwt({token,user}){
            if (user){ 
                token.id = user.id;
            }
            return token
        },
        async session({session,token}){
            if(!session.user){
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    session:{
        strategy: "jwt",
        maxAge: 30*24*60*60
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET
}