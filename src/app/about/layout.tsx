import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - DevSomeWare",
  description:
    "Learn about DevSomeWare, an open-source community empowering developers. Explore our mission, values, and contributions to the tech ecosystem.",
  keywords: [
    "About DevSomeware",
    "DevSomeware Open Source Community",
    "Developer Empowerment",
    "Open Source Contributions",
    "DevSomeware Mission and Vision",
    "About Developer Community",
    "DevSomeware Values",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "About Us - DevSomeWare",
    description:
      "Discover DevSomeWare's mission to empower developers through open-source contributions and community-driven initiatives.",
    url: "https://devsomeware.com/about",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "About DevSomeware - Open Source Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "About Us - DevSomeWare",
    description:
      "Learn about DevSomeWare's journey, mission, and commitment to fostering an open-source community.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/about",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
