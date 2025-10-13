import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'Dashboard', title: 'Dashboard', href: paths.dashboard.dashboard, icon: 'chart-pie' },
  { key: 'Reset Password', title: 'Reset Password', href: paths.auth.resetPassword, icon: 'cog' },
  
] satisfies NavItemConfig[];
