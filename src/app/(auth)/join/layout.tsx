import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Us - DevSomeWare",
  description:
    "Become a part of DevSomeWare, an open-source community dedicated to empowering developers. Collaborate, contribute, and grow with us.",
  keywords: [
    "Join DevSomeware",
    "DevSomeware Membership",
    "Open Source Contribution",
    "Developer Community",
    "Join Open Source Projects",
    "DevSomeware Collaborate",
    "Become a Contributor DevSomeware",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Join Us - DevSomeWare",
    description:
      "Join DevSomeWare's vibrant community of developers. Contribute to open-source projects and shape the future of technology.",
    url: "https://devsomeware.com/join",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "Join DevSomeware - Open Source Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Join Us - DevSomeWare",
    description:
      "Become part of DevSomeWare's mission to foster an inclusive and empowering open-source community.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/join",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
