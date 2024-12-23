import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - DevSomeWare",
  description:
    "Forgot your DevSomeWare password? Recover access to your account quickly and securely. Follow the steps to reset your password and regain control.",
  keywords: [
    "DevSomeWare Forgot Password",
    "Reset DevSomeWare Password",
    "Password Recovery for DevSomeWare",
    "DevSomeWare Account Recovery",
    "Forgot Password DevSomeWare",
    "Open Source Community Password Reset",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Forgot Password - DevSomeWare",
    description:
      "Forgot your password? Recover your DevSomeWare account easily by following the instructions to reset your password and regain access.",
    url: "https://devsomeware.com/forgot",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Forgot Password Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Forgot Password - DevSomeWare",
    description:
      "Forgot your password? Recover your DevSomeWare account with a simple password reset process.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/forgot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
