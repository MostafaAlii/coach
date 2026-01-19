import { ReactNode } from "react";
import { HomeIcon, UserIcon, Cog6ToothIcon, ChartBarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export interface MenuItemType {
    name: string;
    icon?: ReactNode;
    link?: string;
    children?: MenuItemType[];
}

export const menuItems: MenuItemType[] = [
    {
        name: "Dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        link: "/dashboard",
    },
    {
        name: "Analytics",
        icon: <ChartBarIcon className="w-5 h-5" />,
        children: [
            { name: "Reports", link: "/analytics/reports" },
            { name: "Stats", link: "/analytics/stats" },
        ],
    },
    {
        name: "Users",
        icon: <UserIcon className="w-5 h-5" />,
        children: [
            { name: "All Users", link: "/users/all" },
            {
                name: "Roles",
                children: [
                    { name: "Admin", link: "/users/roles/admin" },
                    { name: "Editor", link: "/users/roles/editor" },
                ],
            },
        ],
    },
    {
        name: "Settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        link: "/settings",
    },
];
