import Script from "next/script";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduTrack - Student Affairs Management",
  description: "Comprehensive student affairs management system for tracking courses, assignments, exams, and academic progress.",
  keywords: ["EduTrack", "Student Management", "Academic", "Education", "Next.js"],
  authors: [{ name: "EduTrack Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduTrack",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/Logo1.jpeg",
    apple: "/cache-192.jpeg",
  },
  openGraph: {
    title: "EduTrack - Student Affairs Management",
    description: "Comprehensive student affairs management system",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('Service Worker Registered');
                }).catch(function(err) {
                  console.log('Service Worker Failed to Register', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
