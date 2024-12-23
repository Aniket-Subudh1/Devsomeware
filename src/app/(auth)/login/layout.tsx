import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - DevSomeWare",
  description:
    "Access your DevSomeWare account and explore the open-source community. Log in to collaborate, contribute, and grow as a developer.",
  keywords: [
    "DevSomeWare Login",
    "Login to Open Source Community",
    "Developer Login Page",
    "Access DevSomeWare Account",
    "Join Open Source Community",
    "DevSomeWare Sign In",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Login - DevSomeWare",
    description:
      "Log in to your DevSomeWare account to connect with developers and contribute to open-source projects.",
    url: "https://devsomeware.com/login",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Login Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Login - DevSomeWare",
    description:
      "Access your DevSomeWare account to contribute to open-source projects and collaborate with fellow developers.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/login",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
