import "@/app/globals.css";
import type { Metadata } from "next";
import { Tilt_Warp, Poppins } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import ToastContainer from "@/components/shared/ui/ToastNotification";

// API
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "V-EX+",
  description: "Virtual Exhibition",
};

const tiltWarp = Tilt_Warp({
  subsets: ["latin"],
  variable: "--font-tilt-warp",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${poppins.variable} ${tiltWarp.variable} font-poppins`}>
        <AuthProvider>
          {children}
          <ToastContainer /> 
        </AuthProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
