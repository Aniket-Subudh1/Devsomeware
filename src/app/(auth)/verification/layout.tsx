import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Submitted - DevSomeWare",
  description:
    "Your application has been successfully submitted to DevSomeWare. Our team will review and verify your submission shortly. Stay tuned for updates!",
  keywords: [
    "DevSomeware Application Submitted",
    "DevSomeware Verification",
    "Application Status",
    "DevSomeware Application Review",
    "Application Under Review",
    "DevSomeware Confirmation",
    "Submitted Application",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Application Submitted - DevSomeWare",
    description:
      "Your application has been submitted. Our team will verify it soon, and we will notify you about the next steps.",
    url: "https://devsomeware.com/verification",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeWare Application Submitted - Verification Process",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "Application Submitted - DevSomeWare",
    description:
      "Thank you for submitting your application. DevSomeWare will verify it soon, and you will be notified about the next steps.",
    images: "/alogo.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://devsomeware.com/verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
