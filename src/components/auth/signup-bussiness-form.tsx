'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';

export function SignUpBussinessForm(): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement business signup logic

    setIsSubmitting(false);
  };

  return (
    <Box>
      <Card elevation={16} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h5">Sign up for Business Account</Typography>
            <TextField
              autoFocus
              fullWidth
              label="Business Name"
              name="businessName"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              required
              type="password"
            />
            <Button
              disabled={isSubmitting}
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              type="submit"
              variant="contained"
            >
              Create Account
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}