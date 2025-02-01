import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import NextTopLoader from "nextjs-toploader";
import { ClientWrapper } from "@/wrapper/ClientWrapper";
import StoreProvider from "./StoreProvider";
import { ThemeProvider } from "@/components/theme-provider";
import VerifyUser from "@/server/VerifyUser";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://devsomeware.com"),
  title: "DevSomeware - Open Source Developer Community",
  description:
    "Join DevSomeware, an open-source community for developers to learn, grow, and collaborate. Participate in hackathons, events, and build exciting projects while contributing to open source.",
  keywords: [
    "DevSomeware",
    "Open Source Community",
    "Developer Community",
    "Hackathons",
    "Coding Events",
    "Open Source Contributions",
    "Developer Workshops",
    "Software Development",
    "Collaborate on Projects",
    "Learning Community for Developers",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "DevSomeware - Open Source Developer Community",
    description:
      "DevSomeware is a thriving community for developers to learn, participate in hackathons, and contribute to open source projects.",
    url: "https://devsomeware.com",
    type: "website",
    images: [
      {
        url: "/alogo.png",
        width: 1200,
        height: 630,
        alt: "DevSomeware Open Source Developer Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevSomeware",
    title: "DevSomeware - Open Source Developer Community",
    description:
      "A community where developers can learn, grow, and contribute to open source. Join us for hackathons, workshops, and collaborative projects.",
    images: "/alogo.png",
  },
  robots: "index, follow",
};

interface User {
  name: string;
  email: string;
  img: string;
  github: string;
  linkedin: string;
  intrests: string[];
  languages: string[];
  frameworks: string[];
  bio: string;
  id: string;
}
interface EventData {
  userid: string;
  eventid: string;
  eventname: string;
  ticketid: string;
  email: string;
  iszentrone: boolean;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUserData = null;
  let eventdata = null;

  try {
    const verifyResult = await VerifyUser();
    if (verifyResult.isAuth && verifyResult.user) {
      const user = JSON.parse(verifyResult.user) as User;
      initialUserData = {
        name: user.name,
        email: user.email,
        img: user.img,
        isauth: true,
        github: user.github,
        linkedin: user.linkedin,
        intrests: user.intrests,
        languages: user.languages,
        frameworks: user.frameworks,
        bio: user.bio,
        //@ts-expect-error: _id is not a standard property of User interface
        id:user?._id,
      };
      const event = verifyResult.event ? (JSON.parse(verifyResult.event) as EventData) : null;
      console.log("layout event is ",event);
      eventdata = {
        userid: event?.userid || "",
        eventid: event?.eventid || "",
        eventname: event?.eventname || "",
        ticketid: event?.ticketid || "",
        email: event?.email || "",
        iszentrone: event?.iszentrone || false,
      }
    } else {
      console.warn(`User verification failed: ${verifyResult.error}`);
    }
  } catch (error) {
    console.error("Error verifying user:", error);
  }

  return (
    <html lang="en" className="relative" suppressHydrationWarning>
      <body className={clsx(dmSans.className, "antialiased bg-black")}>
        <NextTopLoader
          color="#800080"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          template='<div class="bar" role="bar"><div class="peg"></div></div> 
            <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={1600}
          showAtBottom={false}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider initialUserData={initialUserData} eventdata={eventdata || { userid: "", eventid: "", eventname: "", ticketid: "", email: "", iszentrone: false }}>
            <ClientWrapper>{children}</ClientWrapper>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
