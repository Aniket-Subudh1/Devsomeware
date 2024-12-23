import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Events - DevSomeWare",
  description:
    "Discover the latest events organized by DevSomeWare, including developer meetups, tech conferences, hackathons, and community gatherings. Stay updated and join us at exciting tech events!",
  keywords: [
    "DevSomeware Events",
    "Upcoming Tech Events",
    "Developer Meetups",
    "Tech Conferences",
    "Hackathons",
    "Community Gatherings",
    "DevSomeware Hackathons",
    "DevSomeware Developer Events",
    "Tech Events in [Your Location]",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Upcoming Events - DevSomeWare",
    description:
      "Join DevSomeWare’s upcoming events, including hackathons, developer meetups, tech conferences, and more. Stay up-to-date with the latest in the tech community.",
    url: "https://devsomeware.com/events",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "Upcoming DevSomeWare Events - Developer Meetups, Hackathons, Conferences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Upcoming Events - DevSomeWare",
    description:
      "Explore and join DevSomeWare’s upcoming events including tech meetups, hackathons, and conferences for developers.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/events",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
