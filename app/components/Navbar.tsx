'use client'

import Link from "next/link";
import NavLink from './NavLink';
import Logo from './Logo';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FaRegCircleUser } from 'react-icons/fa6';

export default function Navbar(){
  const pathname = usePathname();
  const { status } = useSession();
  return(
  <>
      {/* Sticky, translucent bar so the pastel page shows through as you scroll */}
      <header className="sticky top-0 z-30 w-full border-b border-line bg-white/55 backdrop-blur-md">
        <nav className="flex flex-wrap items-center justify-between max-w-7xl gap-x-6 gap-y-2 px-6 py-3.5 mx-auto">
          <Link href="/" aria-label="PrintForge home">
            <Logo />
          </Link>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <NavLink href="/3d-models" isActive={pathname.startsWith("/3d-models")}>3D Models</NavLink>
              {/* Shown to everyone: logged-out users are sent to /login first (proxy.ts and the page check) */}
              <NavLink href="/generate" isActive={pathname.startsWith("/generate")}>3D Construction</NavLink>
              <NavLink href="/about" isActive={pathname === "/about"}>About</NavLink>
              {status === "authenticated" ? (
                <>
                  <NavLink href="/dashboard" isActive={pathname.startsWith("/dashboard")}>
                    <span className="inline-flex items-center gap-1.5"><FaRegCircleUser aria-hidden="true" className="w-3.5 h-3.5" />My account</span>
                  </NavLink>
                  <li className="text-[12.5px] font-medium tracking-[0.06em] uppercase">
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="py-1.5 border-b-2 border-transparent cursor-pointer text-muted transition-colors hover:text-ink">
                      Logout
                    </button>
                  </li>
                </>
              ) : status === "unauthenticated" ? (
                <>
                  <NavLink href="/login" isActive={pathname === "/login"}>Login</NavLink>
                  <li>
                    <Link href="/register" className="btn-primary px-4 py-2 text-[12.5px] tracking-[0.06em] uppercase">Register</Link>
                  </li>
                </>
              ) : null}
          </ul>
        </nav>
      </header>
   </>)
} 


/*
const { data: session, status } = useSession();

useSession() is a React hook from next-auth/react. It returns an object with this shape:

{ data: Session | null, status: "loading" | "authenticated" | "unauthenticated", update: fn }

The line uses destructuring with a rename:
- data: session means "take the data property and call it session". It's purely for readability.
- status is taken as it is.

It's the same as:
const result = useSession()
const session = result.data
const status = result.status

The three status values

┌───────────────────┬────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│      status       │        session         │                                                       Meaning                                                        │
├───────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────┤
│ "loading"         │ undefined              │ Still asking the server. The Navbar renders nothing (null), which avoids flashing "Login" for a moment before the    │
│                   │                        │ name appears                                                                             │
├───────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ "authenticated"   │ { user: {...}, expires │ Logged in. Show the na                                                                   │
│                   │  }                     │                                                                                                                      │
├───────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────┤
│ "unauthenticated" │ null                   │ Logged out. Show Login + Register                                                                                    │
└───────────────────┴────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Where it gets the data

useSession() only works because <Providers> (the SessionProvider) wraps the app in layout.tsx. The provider calls GET /api/auth/session, which goes to your route.ts and
then NextAuth(authOptions). The server decodes the cookie and returnsll shares that result. It also checks again when you switch back tothe browser tab.

Does session.user.name come from authorize?

Yes, but indirectly. It's copied at login time, stored in the JWT cookie, and read back from there:

1. LOGIN (once)
   authorize() returns { id: "1", name: "Test User", email: "..." }   ← your return
        │
        ▼
   jwt({ token, user })   ← `user` = what authorize returned (only on
     NextAuth automatically puts:  token.name, token.email, token.sub (= id)
     your code adds:               token.id = user.id
        │
        ▼
   token signed → stored in the cookie

2. EVERY TIME (useSession / getServerSession)
   cookie decoded → token
        │
        ▼
   session({ session, token })
     NextAuth automatically builds: session.user = { name: token.name}
     your code adds:                session.user.id = token.id
        │
        ▼
   useSession() → session.user.name  ✅

- name and email are copied automatically by NextAuth's defaults. You didn't write code for them.
- id is not copied automatically, which is why you wrote the jwt and hem, session.user.id would be undefined.
- In the jwt callback, user only exists right after sign-in. On later calls it's undefined, which is why the code checks if (user) first.

One side effect to know about

The name is read from the cookie, not the database. If a user changeslater, the Navbar keeps showing the old name until they log out andback in, or until the token is refreshed with useSession().update(). If you build a "edit profile" feature, you'll need to handle that.
*/
