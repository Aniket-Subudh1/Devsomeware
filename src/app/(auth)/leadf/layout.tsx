import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Leads - DevSomeWare Lead Form",
  description:
    "Apply for leads in various tech domains including Web Development, Cloud, AR/VR, Cybersecurity, Full Stack Development, and more. Submit your application and explore opportunities in these cutting-edge fields.",
  keywords: [
    "DevSomeware Lead Application",
    "Web Development Leads",
    "Cloud Technology Leads",
    "AR/VR Leads",
    "Cybersecurity Leads",
    "Full Stack Development Leads",
    "Lead Application for Developers",
    "Tech Leads Application",
    "Apply for DevSomeware Leads",
    "Open Source Development Leads",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Apply for Leads - DevSomeWare Lead Form",
    description:
      "Submit your lead application for opportunities in Web Development, Cloud, AR/VR, Cybersecurity, Full Stack, and more with DevSomeWare.",
    url: "https://devsomeware.com/leadf",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Lead Application for Tech Domains - Web, Cloud, AR/VR, Cybersecurity, Full Stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Apply for Leads - DevSomeWare Lead Form",
    description:
      "Fill out the lead application form to apply for leads in Web, Cloud, AR/VR, Cybersecurity, Full Stack, and more with DevSomeWare.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/leadf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
