import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  const { data } = authClient.getUser();
  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      await checkSession?.();
      router.refresh();
    } catch (error) {
      logger.error('Sign out error', error);
    }
  }, [checkSession, router]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '270px' } } }}
    >
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem sx={{ display: 'block', cursor: 'default' }}>
          <Typography variant="body2" color="text.primary" sx={{ width: '100%', color: 'black' }}>
            Signed in as
          </Typography>
          <Typography variant="subtitle2" sx={{ width: '100%', fontWeight: 'bold', color: 'black', mt: 0.5 }}>
            {data?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ width: '100%', fontSize: 13, mt: 0.5 }}>
            {data?.email}
            //
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Log Out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}