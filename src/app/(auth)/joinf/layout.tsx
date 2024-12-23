import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join DevSomeWare - Registration Form",
  description:
    "Fill out the registration form to join DevSomeWare's open-source community. Become a contributor and collaborate with developers worldwide.",
  keywords: [
    "DevSomeware Registration",
    "Join DevSomeware Form",
    "Open Source Community Signup",
    "Developer Community Registration",
    "Join DevSomeware Open Source",
    "DevSomeware Contributor Form",
    "Sign Up for DevSomeware",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Join DevSomeWare - Registration Form",
    description:
      "Complete the registration form to become a member of DevSomeWare. Start contributing to open-source projects and collaborate with a vibrant developer community.",
    url: "https://devsomeware.com/joinf",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "Join DevSomeWare - Registration Form",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Join DevSomeWare - Registration Form",
    description:
      "Sign up to join DevSomeWare's open-source community. Collaborate, contribute, and grow with developers worldwide.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/joinf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
