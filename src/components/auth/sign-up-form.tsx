"use client";

import * as React from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const schema = zod.object({
  username: zod.string().min(1, { message: "Username is required" }),
  email: zod
    .string()
    .min(1, { message: "Email is required" })
    .email()
    .refine(
      (val) => /^[\w-.]+@([\w-]+\.)?(gmail\.com|edu|org|com)$/.test(val),
      {
        message: "Only .edu, .org, .com or gmail.com emails are allowed",
      }
    ),
  password: zod.string().min(6, {
    message: "Password should be at least 6 characters",
  }),
  phone: zod.string().min(11, {
    message: "Please Enter a valid phone number",
  }),
  otp: zod.string().optional(),
  terms: zod
    .boolean()
    .refine((value) => value, "You must accept the terms and conditions"),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  username: "",
  email: "",
  password: "",
  phone: "",
  terms: false,
};

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [otp, setOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Values | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError: setFormError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setError(null);

      try {
        const allowedDomains = ["gmail.com", "edu", "org", "com"];
        const emailDomain = values.email.split("@")[1];
        const isValidDomain = allowedDomains.some((domain) =>
          emailDomain.endsWith(domain)
        );

        if (!isValidDomain) {
          setError("Only .edu, .org, .com or gmail.com emails are allowed");
          setIsPending(false);
          return;
        }

        const { error } = await authClient.SendOtp({
          ...values,
          phone: Number(values.phone),
        });

        if (error) {
          setError(error as string);
          setIsPending(false);
          return;
        }

        setFormData(values);
        setOtpSent(true);
        localStorage.setItem("pendingRegisterData", JSON.stringify(values));
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsPending(false);
      }
    },
    [router]
  );

  const handleVerifyOtp = async () => {
    setIsPending(true);
    setError(null);

    if (!otp || otp.length < 6) {
      setError("Please enter a valid OTP");
      setIsPending(false);
      return;
    }

    try {
      const { error } = await authClient.signUp({
        ...formData!,
        otp,
      });

      if (error) {
        setError(error);
        setIsPending(false);
        return;
      }

      localStorage.removeItem("pendingRegisterData");
      await checkSession?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("OTP verification failed.");
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setError(null);
    setIsPending(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify({
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
      }));

      await checkSession?.();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'text.primary',
            fontSize: '1.5rem',
            '@media (min-width: 640px)': {
              fontSize: '1.875rem'
            }
          }}
        >
          Sign Up
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          Enter your email and password to sign up!
        </Typography>
      </Box>

      {/* Social Sign In Buttons */}
      <Box sx={{ display: 'grid', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                fill="#4285F4"
              />
              <path
                d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                fill="#34A853"
              />
              <path
                d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                fill="#FBBC05"
              />
              <path
                d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                fill="#EB4335"
              />
            </svg>
          }
          sx={{
            py: 1.5,
            px: 3,
            borderColor: 'grey.300',
            color: 'text.primary',
            backgroundColor: 'grey.100',
            '&:hover': {
              backgroundColor: 'grey.200',
              borderColor: 'grey.400',
            },
            '&.Mui-disabled': {
              backgroundColor: 'grey.100',
              color: 'text.disabled',
            },
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 400,
            minHeight: '48px'
          }}
        >
          {isPending ? 'Signing up...' : 'Sign up with Google'}
        </Button>
      </Box>

      {/* Divider */}
      <Box sx={{ position: 'relative', py: 2, mb: 2 }}>
        <Divider />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            px: 2,
            backgroundColor: 'background.paper',
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          Or
        </Box>
      </Box>

      {!otpSent ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Two-column row: Username and Phone */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.username)} variant="outlined" size="medium">
                    <InputLabel sx={{ fontSize: '0.875rem' }}>Username *</InputLabel>
                    <OutlinedInput
                      {...field}
                      label="Username *"
                      placeholder="Enter your username"
                      sx={{ fontSize: '0.875rem' }}
                    />
                    {errors.username && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.username.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.phone)} variant="outlined" size="medium">
                    <InputLabel sx={{ fontSize: '0.875rem' }}>Phone *</InputLabel>
                    <OutlinedInput
                      {...field}
                      label="Phone *"
                      type="tel"
                      placeholder="Enter your phone"
                      sx={{ fontSize: '0.875rem' }}
                    />
                    {errors.phone && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.phone.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)} variant="outlined" size="medium">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Email *</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="Email *"
                    type="email"
                    placeholder="Enter your email"
                    sx={{ fontSize: '0.875rem' }}
                  />
                  {errors.email && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.email.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <FormControl error={Boolean(errors.password)} variant="outlined" size="medium">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Password *</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    sx={{ fontSize: '0.875rem' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <EyeSlashIcon fontSize="16" /> : <EyeIcon fontSize="16" />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {errors.password && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.password.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Terms and Conditions */}
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      size="small"
                      sx={{
                        color: 'text.primary',
                        '&.Mui-checked': {
                          color: '#465FFF',
                        },
                        padding: '8px'
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                      By creating an account means you agree to the{" "}
                      <Box component="span" sx={{ color: 'text.primary' }}>
                        Terms and Conditions,
                      </Box>{" "}
                      and our{" "}
                      <Box component="span" sx={{ color: 'text.primary' }}>
                        Privacy Policy
                      </Box>
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', margin: 0 }}
                />
              )}
            />

            {/* Error Alert */}
            {error && <Alert severity="error" sx={{ fontSize: '0.875rem' }}>{error}</Alert>}

            {/* Send OTP Button */}
            <Button
              disabled={isPending}
              type="submit"
              variant="contained"
              sx={{
                py: 1.5,
                backgroundColor: '#465FFF',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: '#2f47d1',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'grey.400',
                }
              }}
            >
              {isPending ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </Stack>
        </form>
      ) : (
        <>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 1 }}>Verify OTP</Typography>
          <Typography variant="body1" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 3 }}>
            OTP sent to {formData?.email}
          </Typography>

          <FormControl error={!!error} variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel sx={{ fontSize: '0.875rem' }}>Enter OTP *</InputLabel>
            <OutlinedInput
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              label="Enter OTP *"
              type="text"
              sx={{ fontSize: '0.875rem' }}
            />
            {error && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{error}</FormHelperText>}
          </FormControl>

          <Button
            onClick={handleVerifyOtp}
            disabled={isPending}
            variant="contained"
            sx={{
              py: 1.5,
              backgroundColor: '#465FFF',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#2f47d1',
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.400',
              }
            }}
          >
            {isPending ? 'Verifying...' : 'Verify & Register'}
          </Button>
        </>
      )}

      {/* Sign In Link */}
      <Box sx={{ mt: 4, textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          Already have an account?{" "}
          <Link
            component={RouterLink}
            href={paths.auth.signIn}
            sx={{
              color: '#465FFF',
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': { color: '#2f47d1' }
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}