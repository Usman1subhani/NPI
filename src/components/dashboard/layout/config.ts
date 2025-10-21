import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{ key: "Dashboard", title: "Dashboard", href: paths.dashboard.dashboard, icon: "chart-pie" },
	{ key: "Messaging", title: "Messaging", href: paths.messaging.inbox, icon: "envelope" }, 
	{ key: "GoogleUser", title: "Authorized-Users", href: paths.google.list, icon: "users" },
] satisfies NavItemConfig[];
