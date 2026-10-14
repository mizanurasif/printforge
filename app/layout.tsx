import "./globals.css";
import { Albert_Sans, Montserrat_Alternates } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./components/Providers";

const albertSans = Albert_Sans({
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
      <body className={`${albertSans.className} ${montserrat_Alternates.variable} flex flex-col min-h-screen`}>
        <Providers>
          <Navbar/>
          {/* flex-1 pushes the footer to the bottom on short pages */}
          <div className="flex-1">{children}</div>
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
