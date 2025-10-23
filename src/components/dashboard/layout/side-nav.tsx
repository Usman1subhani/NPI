"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// import { ArrowSquareUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareUpRight';

import type { NavItemConfig } from "@/types/nav";
// import { paths } from '@/paths';
import { isNavItemActive } from "@/lib/is-nav-item-active";

// import { Logo } from '@/components/core/logo';

import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { Avatar } from "@mui/material";
import { useUser } from "@/hooks/use-user";

export function SideNav(): React.JSX.Element {
	const pathname = usePathname();
	const { user } = useUser();

	const role = (user?.role || '').toString().toLowerCase();

	let itemsToRender = navItems;
	if (role === 'superadmin') {
		itemsToRender = navItems; // show all
	} else if (role === 'admin') {
		itemsToRender = navItems.filter(i => i.key !== 'GoogleUser');
	} else {
		itemsToRender = navItems.filter(i => i.key === 'Dashboard');
	}

	return (
		<Box
			sx={{
				"--SideNav-background": "var(--mui-palette-neutral-950)",
				"--SideNav-color": "var(--mui-palette-common-white)",
				"--NavItem-color": "var(--mui-palette-neutral-300)",
				"--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
				"--NavItem-active-background": "var(--mui-palette-primary-main)",
				"--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
				"--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
				"--NavItem-icon-color": "var(--mui-palette-neutral-400)",
				"--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
				"--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
				bgcolor: "var(--SideNav-background)",
				color: "var(--SideNav-color)",
				display: { xs: "none", lg: "flex" },
				flexDirection: "column",
				height: "100%",
				left: 0,
				maxWidth: "100%",
				position: "fixed",
				scrollbarWidth: "none",
				top: 0,
				paddingTop: "12px",
				width: "var(--SideNav-width)",
				zIndex: "var(--SideNav-zIndex)",
				"&::-webkit-scrollbar": { display: "none" },
			}}
		>
			<Stack spacing={2} sx={{ p: 3 }}>
				<Box
					sx={{
						alignItems: "center",
						backgroundColor: "var(--mui-palette-neutral-950)",
						border: "1px solid var(--mui-palette-neutral-700)",
						borderRadius: "12px",
						cursor: "pointer",
						display: "flex",
						p: "4px 12px",
					}}
				>
					<Box sx={{ flex: "1 1 auto" }}>
						<Typography color="var(--mui-palette-neutral-400)" variant="body2">
							NPPES NPI
						</Typography>
						<Typography color="inherit" variant="subtitle1">
							Registry
						</Typography>
					</Box>
				</Box>
			</Stack>
			<Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
			<Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
				{renderNavItems({ pathname, items: itemsToRender })}
			</Box>
			<Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
			<Stack spacing={2} sx={{ p: "12px" }}>
				{/* User area at bottom */}
				<UserArea />
			</Stack>
		</Box>
	);
}

function UserArea(): React.JSX.Element {
	const { user } = useUser();

	const name = user?.name || '';
	const email = user?.email || '';
	const initial = name ? name.charAt(0).toUpperCase() : 'U';

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
			<Avatar sx={{ width: 40, height: 40, bgcolor: '#161950' }} src={user?.avatar}>
				{!user?.avatar ? initial : null}
			</Avatar>
			<Box sx={{ overflow: 'hidden' }}>
				<Typography sx={{ fontSize: 13, fontWeight: 700, color: 'inherit', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 160 }}>{name || 'Guest'}</Typography>
				<Typography sx={{ fontSize: 12, color: 'var(--mui-palette-neutral-400)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 160 }}>{email}</Typography>
			</Box>
		</Box>
	);
}
function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
	const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
		const { key, ...item } = curr;

		acc.push(<NavItem key={key} pathname={pathname} {...item} />);

		return acc;
	}, []);

	return (
		<Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
			{children}
		</Stack>
	);
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
	pathname: string;
	items?: NavItemConfig[];
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title, items }: NavItemProps): React.JSX.Element {
	const active = isNavItemActive({ disabled, external, href, matcher, pathname });
	const Icon = icon ? navIcons[icon] : null;
	const [open, setOpen] = React.useState(false);

	const hasChildren = Array.isArray(items) && items.length > 0;

	const toggleOpen = () => {
		if (hasChildren) {
			setOpen((prev) => !prev);
		}
	};
	return (
		<li>
			<Box
				onClick={toggleOpen}
				{...(href && !hasChildren
					? {
						component: external ? "a" : RouterLink,
						href,
						target: external ? "_blank" : undefined,
						rel: external ? "noreferrer" : undefined,
					}
					: { role: "button" })}
				sx={{
					alignItems: "center",
					borderRadius: 1,
					color: "var(--NavItem-color)",
					cursor: "pointer",
					display: "flex",
					flex: "0 0 auto",
					gap: 1,
					p: "6px 16px",
					position: "relative",
					textDecoration: "none",
					whiteSpace: "nowrap",
					...(disabled && {
						bgcolor: "var(--NavItem-disabled-background)",
						color: "var(--NavItem-disabled-color)",
						cursor: "not-allowed",
					}),
					...(active && { bgcolor: "#161950", color: "var(--NavItem-active-color)" }),
				}}
			>
				<Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
					{Icon ? (
						<Icon
							fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
							fontSize="var(--icon-fontSize-md)"
							weight={active ? "fill" : undefined}
						/>
					) : null}
				</Box>
				<Box sx={{ flex: "1 1 auto" }}>
					<Typography
						component="span"
						sx={{ color: "inherit", fontSize: "0.875rem", fontWeight: 500, lineHeight: "28px" }}
					>
						{title}
					</Typography>
				</Box>
				{hasChildren && <Box sx={{ fontSize: "0.75rem", opacity: 0.6 }}>{open ? "▲" : "▼"}</Box>}
			</Box>
			{hasChildren && open && (
				<Stack component="ul" spacing={0.5} sx={{ listStyle: "none", pl: 4, mt: 0.5 }}>
					{items.map((sub) => (
						<NavItem pathname={pathname} {...sub} />
					))}
				</Stack>
			)}
		</li>
	);
}
