import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Tickets - DevSomeWare",
  description:
    "Buy tickets for DevSomeWare's upcoming events, including tech meetups, hackathons, conferences, and more. Get your tickets today and be part of exciting tech gatherings!",
  keywords: [
    "DevSomeware Event Tickets",
    "Buy Tickets for Tech Events",
    "DevSomeware Hackathon Tickets",
    "Tech Conference Tickets",
    "Developer Meetup Tickets",
    "Event Tickets DevSomeware",
    "Tech Event Registration",
    "DevSomeware Ticket Purchase",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Event Tickets - DevSomeWare",
    description:
      "Purchase tickets for DevSomeWare’s upcoming events like hackathons, tech meetups, and developer conferences. Secure your spot now!",
    url: "https://devsomeware.com/tickets",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Event Tickets - Tech Conferences, Hackathons, Meetups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Event Tickets - DevSomeWare",
    description:
      "Get your tickets for DevSomeWare’s upcoming tech events, including hackathons, conferences, and meetups. Book now!",
    images: "/event-tickets-banner.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/tickets",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
