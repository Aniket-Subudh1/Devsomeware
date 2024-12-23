import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Reset - DevSomeWare",
  description:
    "Reset your DevSomeWare password securely. Enter your new password to regain full access to your account and continue contributing to open-source projects.",
  keywords: [
    "DevSomeWare Password Reset",
    "Reset DevSomeWare Password",
    "Set New Password DevSomeWare",
    "DevSomeWare Account Security",
    "Change Password DevSomeWare",
    "Open Source Community Password Reset",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Password Reset - DevSomeWare",
    description:
      "Reset your DevSomeWare password and regain access to your account by setting a new password. Stay secure while contributing to open-source projects.",
    url: "https://devsomeware.com/reset",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Password Reset Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Password Reset - DevSomeWare",
    description:
      "Reset your password on DevSomeWare to regain access and continue collaborating with the open-source community.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/reset",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
