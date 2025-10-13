import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import  Layout  from './../../dashboard/layout';
import { SecureResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = { title: `Reset password | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      
        <SecureResetPasswordForm />
      
    </Layout>
  );
}
