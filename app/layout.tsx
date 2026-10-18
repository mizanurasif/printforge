import "./globals.css";
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
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en">
      <body className={`${figtree.className} ${montserrat_Alternates.variable} flex flex-col min-h-screen bg-page text-ink antialiased`}>
        <Providers>
          <Navbar/>
          {/* flex-1 pushes the footer to the bottom on short pages */}
          <div className="flex flex-col flex-1">{children}</div>
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
