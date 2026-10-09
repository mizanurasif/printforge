import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const {pathname}  = req.nextUrl;
        if(pathname.startsWith("/api/auth")){
            return true
        }
        if( pathname.startsWith("/3d-models") ||  pathname.startsWith("/"))
        {
            return true;
        }
        return !(!token)
      },
   },
  },
)

export const config = { matcher: [""] } 