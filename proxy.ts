import { withAuth } from "next-auth/middleware"

// Redirects logged-out users to /login. withAuth doesn't read authOptions,
// so the custom sign-in page has to be repeated here.
export default withAuth({
  pages: { signIn: "/login" },
})

// Only list private routes here; everything else stays public
export const config = { matcher: ["/dashboard/:path*"] }
