import type { Metadata } from "next";
import "./globals.css";
import Provider from "../Provider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "SPS Marketing",
  description: "Best place to purchage groceries.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Suspense fallback={null}>
            <Provider>{children}</Provider>
          </Suspense>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
