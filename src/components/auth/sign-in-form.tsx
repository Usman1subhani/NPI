'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [rememberMe, setRememberMe] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const [googleError, setGoogleError] = React.useState<string | null>(null);

  // Small uniform scale for the form to reduce size by a few pixels visually.
  const FORM_SCALE = 0.96; // tweak (0.94 - 0.98) to adjust overall size

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signInWithPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
    },
    [checkSession, router, setError]
  );

  //----------------- Google sign in logic here -----------------
  // const handleGoogleSignIn = async (): Promise<void> => {
  //   setGoogleError(null);
  //   setIsPending(true);
  //   try {
  //     const result = await signInWithPopup(auth, googleProvider);
  //     const token = await result.user.getIdToken();

  //     const userData = {
  //       id: result.user.uid,
  //       name: result.user.displayName,
  //       email: result.user.email,
  //       avatar: result.user.photoURL || result.user.providerData?.[0]?.photoURL || null,
  //     };

  //     // ✅ Send user info to your backend
  //     const res = await fetch("http://192.168.18.136:4000/google-user", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(userData),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       if (data.status === "approved") {
  //         // Save token and user for session management
  //         localStorage.setItem("auth-token", token);
  //         localStorage.setItem("user", JSON.stringify(userData));

  //         await checkSession?.();
  //         router.refresh();
  //       } else if (data.status === "pending") {
  //         alert("Your account is pending admin approval.");
  //       } else {
  //         alert("Access denied. Please contact admin.");
  //       }
  //     } else {
  //       throw new Error(data.message || "Failed to communicate with backend.");
  //     }
  //   } catch (err: any) {
  //     console.error(err);
  //     setGoogleError(err?.message || String(err));
  //   } finally {
  //     setIsPending(false);
  //   }
  // };
  //-------------------------------------------------------------

  const handleGoogleSignIn = async (): Promise<void> => {
    setGoogleError(null);
    setIsPending(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // Store token and user in localStorage similar to authClient
      localStorage.setItem('auth-token', token);
      // Save avatar/photo if available so other components can use it
      localStorage.setItem('user', JSON.stringify({
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL || result.user.providerData?.[0]?.photoURL || null,
      }));

      // Refresh auth state
      await checkSession?.();
      router.refresh();
    } catch (err: any) {
      setGoogleError(err?.message || String(err));
    } finally {
      setIsPending(false);
    }
  };
  return (
    <Box sx={{ display: 'flex', minHeight: '50vh' }}>
      {/* Left column: form area */}
      <Box sx={{ flex: 1, maxWidth: 720, px: { xs: 3, md: 8 }, py: 8, bgcolor: 'background.default', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', transform: `scale(${FORM_SCALE})`, transformOrigin: 'top left' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '1.625rem' }}>
              Sign In
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Enter your email and password to sign in!
            </Typography>
          </Box>

          {/* Social Sign In Buttons (two columns) */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={isPending}
              startIcon={/* google svg */ (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4" />
                  <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853" />
                  <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05" />
                  <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335" />
                </svg>
              )}
              sx={{
                py: 1.5,
                borderColor: 'grey.300',
                color: 'text.primary',
                backgroundColor: 'grey.100',
                '&:hover': { backgroundColor: 'grey.200', borderColor: 'grey.400' },
                '&.Mui-disabled': { backgroundColor: 'grey.100', color: 'text.disabled' },
                textTransform: 'none'
              }}
            >
              {isPending ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ position: 'relative', py: 2, mb: 2 }}>
            <Divider />
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', px: 2, backgroundColor: 'background.paper', color: 'text.secondary', fontSize: '0.875rem' }}>Or</Box>
          </Box>

          {/* Email and Password Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Email Field */}
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.email)} variant="outlined">
                    <InputLabel htmlFor="email">Email *</InputLabel>
                    <OutlinedInput {...field} id="email" label="Email *" type="email" placeholder="info@gmail.com" />
                    {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />

              {/* Password Field */}
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.password)} variant="outlined">
                    <InputLabel htmlFor="password">Password *</InputLabel>
                    <OutlinedInput
                      {...field}
                      id="password"
                      label="Password *"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      endAdornment={
                        <Box component="button" type="button" onClick={() => setShowPassword(!showPassword)} sx={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                          {showPassword ? <EyeSlashIcon fontSize="var(--icon-fontSize-md)" /> : <EyeIcon fontSize="var(--icon-fontSize-md)" />}
                        </Box>
                      }
                    />
                    {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />

              {/* Remember Me and Forgot Password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} sx={{ color: '#465FFF', '&.Mui-checked': { color: '#465FFF' } }} />} label="Keep me logged in" sx={{ color: 'text.primary', '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }} />
                <Link component={RouterLink} href={paths.auth.forgotPassword} sx={{ fontSize: '0.875rem', color: '#465FFF', textDecoration: 'none', fontWeight: 700, '&:hover': { color: '#2f47d1' } }}>Forgot password?</Link>
              </Box>

              {/* Error Alert */}
              {errors.root ? <Alert severity="error">{errors.root.message}</Alert> : null}
              {googleError ? <Alert severity="error">{googleError}</Alert> : null}

              {/* Sign In Button */}
              <Button type="submit" fullWidth disabled={isPending} variant="contained" sx={{ py: 1.5, backgroundColor: '#465FFF', fontWeight: 700, '&:hover': { backgroundColor: '#2f47d1' }, '&.Mui-disabled': { backgroundColor: 'grey.400' } }}>{isPending ? 'Signing in...' : 'Sign in'}</Button>

              {/* Sign Up Link */}
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>Don't have an account?{' '}
                <Link component={RouterLink} href="/auth/sign-up" sx={{ color: '#465FFF', fontWeight: 700, textDecoration: 'none', '&:hover': { color: '#2f47d1' } }}>Sign Up</Link>
              </Typography>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}