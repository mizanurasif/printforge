import "./globals.css";
import type { Metadata } from "next";
import { Figtree, Montserrat_Alternates } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./components/Providers";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap"
})

const montserrat_Alternates = Montserrat_Alternates({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat-alternates"
})
// Every page's browser-tab title is "<page> | PrintForge"; pages set their part with `metadata` or `generateMetadata`
export const metadata: Metadata = {
  title: { default: "PrintForge | 3D printable models", template: "%s | PrintForge" },
  description: "Discover, share and print 3D models made by a community of makers. Spin every model in 3D before you download it.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en">
      <body className={`${figtree.className} ${montserrat_Alternates.variable} flex flex-col min-h-screen bg-page text-ink antialiased`}>
        <Providers>
          {/* First Tab stop: lets keyboard users jump past the menu */}
          <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-3 focus:left-3 btn-primary">
            Skip to content
          </a>
          <Navbar/>
          {/* flex-1 pushes the footer to the bottom on short pages. *:w-full: a centred page (mx-auto) in a flex column
              would otherwise shrink to fit its content and could end up wider than a phone screen */}
          <div id="content" tabIndex={-1} className="flex flex-col flex-1 *:w-full focus:outline-none">{children}</div>
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
