import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LegalPro Dashboard",
  description: "Legal Case Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: { background: '#10b981', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#10b981' },
            },
            error: {
              style: { background: '#ef4444', color: '#fff' },
            }
          }}
        />
      </body>
    </html>
  );
}