import {
  HomeIcon,
  Contact,
  Users,
  Merge,
  Calendar,
  BookUser,
} from "lucide-react";

export const navItems = [
  {
    id: 1,
    link: "/",
    icon: <HomeIcon className="h-5 w-5 text-neutral-500 dark:text-white" />,
    name: "Home",
  },
  {
    id: 2,
    link: "/about",
    icon: <BookUser className="h-5 w-5 text-neutral-500 dark:text-white" />,
    name: "About",
  },
  {
    id: 3,
    link: "/events",
    icon: <Calendar className="h-5 w-5 text-neutral-500 dark:text-white" />,
    name: "Events",
  },
  {
    id: 4,
    link: "/team",
    icon: <Users className="h-5 w-5 text-neutral-500 dark:text-white" />,
    name: "Team",
  },
  {
    id: 5,
    link: "/contact",
    icon: <Contact className="h-5 w-5 text-neutral-500 dark:text-white" />,
    name: "Contact Us",
  },
  {
    id: 6,
    link: "/join",
    icon: <Merge className="h-5 w-5 text-neutral-500 dark:text-white" />,
    name: "Join Us",
  },
];
