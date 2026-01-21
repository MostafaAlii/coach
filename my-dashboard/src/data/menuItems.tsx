import { ReactNode } from "react";
import {
    HomeIcon,
    Cog6ToothIcon,
    RectangleStackIcon,
    PhotoIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";

export interface MenuItemType {
    name: string;
    icon?: ReactNode;
    link?: string;
    children?: MenuItemType[];
    badge?: string | number;
    badgeType?: "info" | "warning" | "danger";
}

export const menuItems: MenuItemType[] = [
    {
        name: "Dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        link: "/dashboard",
    },
    {
        name: "Settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        children: [
            { name: "Main Settings", link: "/settings/main" },
        ],
    },
    {
        name: "Sections",
        icon: <RectangleStackIcon className="w-5 h-5" />,
        children: [
            { name: "Hero Section", link: "/sections/hero" },
            { name: "About Section", link: "/sections/about" },
            { name: "Journey Section", link: "/sections/journey" },
        ],
    },
    {
        name: "Gallery",
        icon: <PhotoIcon className="w-5 h-5" />,
        children: [
            { name: "Gallery Management", link: "/gallery/management" },
        ],
    },
    {
        name: "Contact Us",
        icon: <EnvelopeIcon className="w-5 h-5" />,
        children: [
            { name: "Messages Management", link: "/contact/messages" },
        ],
    },
];
