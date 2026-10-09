
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
        async authorize(credentials) {
            // Return null (not throw) on every failure so the login page
            // can't tell "unknown email" apart from "wrong password"
            if(!credentials?.email || !credentials.password){
                return null
            }

            const user = getUserByEmail(credentials.email)
            if(!user)
            {
                return null
            }
            const isValid = await bcrypt.compare(credentials.password,user.passwordHash)
            if(!isValid)
            {
                return null
            }
            return{
                id: String(user.id),
                email: user.email,
                name: user.name
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
            if(session.user){
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