import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - DevSomeWare",
  description:
    "View and update your DevSomeWare profile. Manage your contributions, track your open-source projects, and customize your developer identity in the DevSomeWare community.",
  keywords: [
    "DevSomeWare Profile",
    "Update DevSomeWare Profile",
    "Manage DevSomeWare Account",
    "Developer Profile DevSomeWare",
    "Open Source Developer Profile",
    "DevSomeWare Contributions",
    "DevSomeWare Community Profile",
    "Update Developer Identity",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Profile - DevSomeWare",
    description:
      "Access and update your DevSomeWare profile. Showcase your open-source contributions, track your projects, and connect with the developer community.",
    url: "https://devsomeware.com/profile",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Profile Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Profile - DevSomeWare",
    description:
      "Manage and update your DevSomeWare profile to reflect your open-source journey. Track contributions and connect with like-minded developers.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/profile",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
