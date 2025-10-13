import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { SecureForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Layout } from '@/components/auth/layout';
import { Suspense } from 'react';
export const metadata = { title: `Reset password | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <SecureForgotPasswordForm />
      </Suspense>
    </Layout>
  );
}
