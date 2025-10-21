"use client";

import * as React from "react";
// import Avatar from "@mui/material/Avatar";
// import Badge from '@mui/material/Badge';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
// import Tooltip from '@mui/material/Tooltip';
// import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";

import { authClient } from "@/lib/auth/client";
// import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
// import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { usePopover } from "@/hooks/use-popover";
import { InitialAvatar } from "@/components/dashboard/layout/avatar";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";
import { Tooltip } from "@mui/material";

export function MainNav(): React.JSX.Element {
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const { data } = authClient.getUser();
	const userPopover = usePopover<HTMLDivElement>();

	return (
		<React.Fragment>
			<Box
				component="header"
				sx={{
					borderBottom: "1px solid var(--mui-palette-divider)",
					backgroundColor: "var(--mui-palette-background-paper)",
					position: "sticky",
					top: 0,
					zIndex: "var(--mui-zIndex-appBar)",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					sx={{ alignItems: "center", justifyContent: "space-between", minHeight: "64px", px: 2 }}
				>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						{/* <Tooltip title="Search">
							<IconButton>
								<MagnifyingGlassIcon />
							</IconButton>
						</Tooltip> */}
						<Tooltip title="Title">

							{/* <h2>MedCredPro RCM</h2> */}
							<h2>Medical Billing</h2>


						</Tooltip>
						{/* <Tooltip title="Notifications">
							<IconButton>
								<Badge badgeContent={4} color="error">
									<BellIcon />
								</Badge>
							</IconButton>
						</Tooltip> */}

					</Stack>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<IconButton
							onClick={(): void => {
								setOpenNav(true);
							}}
							sx={{ display: { lg: "none" } }}
						>
							<ListIcon />
						</IconButton>
					</Stack>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<InitialAvatar
							onClick={userPopover.handleOpen}
							ref={userPopover.anchorRef}
							sx={{ cursor: "pointer" }}
							name={data?.name ?? ""}
						/>
					</Stack>
				</Stack>
			</Box>
			<UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
			<MobileNav
				onClose={() => {
					setOpenNav(false);
				}}
				open={openNav}
			/>
		</React.Fragment>
	);
}
