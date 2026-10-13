import module from "next-auth"

interface Session {
   user: {
      address: string
    } & DefaultSession["user"]
}


/*
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      address: string
    } & DefaultSession["user"]
  }
}
*/