import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Payroll Review Copilot",
  description: "Secure demo access for payroll review sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
