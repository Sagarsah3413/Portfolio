import { Outfit, Ovo } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});
const ovo = Ovo({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ovo",
});

export const metadata = {
  title: "Portfolio - Sagar",
  description:
    "Portfolio of Sagar Kumar Sah, a full-stack developer specializing in modern web technologies and scalable backend systems.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${ovo.variable} scroll-smooth dark`}
    >
      <body
        className={`${outfit.variable} ${ovo.variable} antialiased leading-8 overflow-x-hidden dark:bg-darkTheme dark:text-white `}
      >
        {children}
      </body>
    </html>
  );
}
