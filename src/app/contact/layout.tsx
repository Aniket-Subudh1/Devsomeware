import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - DevSomeware",
  description:
    "Get in touch with the DevSomeWare team. Reach out for partnership opportunities, community events, support, or general inquiries.",
  keywords: [
    "DevSomeware Contact",
    "Contact DevSomeware",
    "Developer Community Support",
    "Open Source Community Contact",
    "DevSomeware Support",
    "DevSomeware Events",
    "Developer Community Partnership",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Contact Us - DevSomeWare",
    description:
      "Reach out to the DevSomeWare team for support, events, partnerships, and community inquiries.",
    url: "https://devsomeware.com/Contact",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "Contact DevSomeware - Open Source Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Contact Us - DevSomeware",
    description:
      "Get in touch with DevSomeware for support, events, partnerships, and community inquiries.",
    images: "/alogo.png",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
