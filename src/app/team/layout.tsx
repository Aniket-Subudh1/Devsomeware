import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams - DevSomeWare",
  description:
    "Explore the teams at DevSomeWare. Discover various open-source teams, their missions, contributions, and how you can collaborate with like-minded developers.",
  keywords: [
    "DevSomeWare Teams",
    "Open Source Teams",
    "Collaborate with Developers",
    "Join Open Source Teams",
    "DevSomeWare Contributors",
    "Developer Collaboration",
    "Open Source Community Teams",
    "DevSomeWare Community Projects",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Teams - DevSomeWare",
    description:
      "Discover and join open-source teams within DevSomeWare. Connect with developers, contribute to impactful projects, and make a difference in the tech community.",
    url: "https://devsomeware.com/team",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Teams Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Teams - DevSomeWare",
    description:
      "Explore DevSomeWare teams, their missions, and contribute to exciting open-source projects. Join the community and collaborate with developers worldwide.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/team",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
