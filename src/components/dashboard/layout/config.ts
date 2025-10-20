import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{ key: "Dashboard", title: "Dashboard", href: paths.dashboard.dashboard, icon: "chart-pie" },
	{ key: "Reset Password", title: "Reset Password", href: paths.auth.resetPassword, icon: "gear-six" },
	{ key: "Properties", title: "Properties", href: paths.properties.list, icon: "building" },
	{ key: "Messaging", title: "Messaging", href: paths.messaging.inbox, icon: "envelope" },
] satisfies NavItemConfig[];
