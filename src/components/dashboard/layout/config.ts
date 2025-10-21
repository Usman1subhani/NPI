import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{ key: "Dashboard", title: "Dashboard", href: paths.dashboard.dashboard, icon: "chart-pie" },
	{ key: "Messaging", title: "Messaging", href: paths.messaging.inbox, icon: "envelope" }, 
	{ key: "Leads", title: "Leads", href: paths.lead.leads, icon: "gear-six" },
	{ key: "Properties", title: "Properties", href: paths.properties.list, icon: "building" },
] satisfies NavItemConfig[];
