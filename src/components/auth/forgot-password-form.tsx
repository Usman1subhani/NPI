"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";
import { paths } from "@/paths";

// Separate schemas for email and password (optional)
const schemaEmail = zod.object({
	email: zod.string().min(1, "Email is required").email("Invalid email"),
});

const schemaPassword = zod
	.object({
		password: zod.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: zod.string().min(6, "Confirm Password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export function SecureForgotPasswordForm() {
	const [isPending, setIsPending] = React.useState(false);
	const [success, setSuccess] = React.useState("");
	const [error, setError] = React.useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const tokenFromUrl = searchParams.get("token") || "";
	const [view, setView] = React.useState<"email" | "password">(tokenFromUrl ? "password" : "email");
	const [showPassword, setShowPassword] = React.useState(false);

	React.useEffect(() => {
		const handleStorage = (e: StorageEvent) => {
			if (e.key === "passwordResetSuccess" && e.newValue === "true") {
				localStorage.removeItem("passwordResetSuccess");
				router.push("/auth/sign-in");
			}
		};

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		defaultValues: { email: "", password: "", confirmPassword: "" },
	});

	const onSubmit = async (values: any) => {
		setIsPending(true);
		setError("");
		setSuccess("");

		try {
			if (view === "email") {
				// Validate email manually
				if (!values.email) {
					setError("Email is required");
					setIsPending(false);
					return;
				}

				const { error } = await authClient.sendForgotPasswordLink({ email: values.email });
				if (error) setError(error);
				else setSuccess("Password reset link sent. Check your email.");
			} else {
				// Validate password manually
				if (!values.password || !values.confirmPassword) {
					setError("Password and Confirm Password are required");
					setIsPending(false);
					return;
				}
				if (values.password !== values.confirmPassword) {
					setError("Passwords don't match");
					setIsPending(false);
					return;
				}

				const token = tokenFromUrl;
				if (!token) {
					setError("Invalid or missing token");
					setIsPending(false);
					return;
				}

				const { error } = await authClient.forgotPassword({
					password: values.password,
					resetToken: token,
				});
				if (error) setError(error);
				else {
					localStorage.setItem("passwordResetSuccess", "true");
					setSuccess("Password reset successfully.");
					router.push("/auth/sign-in");
					localStorage.removeItem("passwordResetSuccess");
				}
			}
		} catch {
			setError("Network error");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto', mt: 4 }}>
			{/* Header Section */}
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
					{view === "email" ? "Forgot Your Password?" : "Reset Your Password"}
				</Typography>
				<Typography
					variant="body1"
					sx={{
						color: 'text.secondary',
						fontSize: '0.875rem',
						lineHeight: 1.5
					}}
				>
					{view === "email"
						? "Enter the email address linked to your account, and we'll send you a link to reset your password."
						: "Enter your new password below to reset your account password."
					}
				</Typography>
			</Box>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={3}>
					{view === "email" ? (
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<FormControl error={Boolean(errors.email)} variant="outlined">
									<InputLabel sx={{ fontSize: '0.875rem' }}>Email *</InputLabel>
									<OutlinedInput
										{...field}
										type="email"
										label="Email *"
										placeholder="Enter your email"
										sx={{ fontSize: '0.875rem' }}
									/>
									{errors.email && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.email?.message?.toString()}</FormHelperText>}
								</FormControl>
							)}
						/>
					) : (
						<>
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<FormControl error={Boolean(errors.password)} variant="outlined" size="small">
										<InputLabel sx={{ fontSize: '0.875rem' }}>New Password *</InputLabel>
										<OutlinedInput
											{...field}
											type={showPassword ? "text" : "password"}
											label="New Password *"
											placeholder="Enter your new password"
											sx={{ fontSize: '0.875rem' }}
											endAdornment={
												<Box
													component="button"
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													sx={{
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														display: 'flex',
														alignItems: 'center',
														color: 'text.secondary',
														'&:hover': { color: 'text.primary' }
													}}
												>
													{showPassword ? (
														<EyeSlashIcon fontSize="16" />
													) : (
														<EyeIcon fontSize="16" />
													)}
												</Box>
											}
										/>
										{errors.password && <FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.password?.message?.toString()}</FormHelperText>}
									</FormControl>
								)}
							/>
							<Controller
								name="confirmPassword"
								control={control}
								render={({ field }) => (
									<FormControl error={Boolean(errors.confirmPassword)} variant="outlined" size="small">
										<InputLabel sx={{ fontSize: '0.875rem' }}>Confirm Password *</InputLabel>
										<OutlinedInput
											{...field}
											type="password"
											label="Confirm Password *"
											placeholder="Confirm your new password"
											sx={{ fontSize: '0.875rem' }}
										/>
										{errors.confirmPassword && (
											<FormHelperText sx={{ fontSize: '0.75rem', mx: 0 }}>{errors.confirmPassword?.message?.toString()}</FormHelperText>
										)}
									</FormControl>
								)}
							/>
						</>
					)}

					{error && <Alert severity="error" sx={{ fontSize: '0.875rem' }}>{error}</Alert>}
					{success && <Alert severity="success" sx={{ fontSize: '0.875rem' }}>{success}</Alert>}

					{/* Divider */}
					<Box sx={{ borderTop: 1, borderColor: 'grey.200', my: 1 }} />

					{/* Send Reset Link Button */}
					<Button
						type="submit"
						disabled={isPending}
						variant="contained"
						sx={{
							py: 1.5,
							backgroundColor: '#465FFF',
							fontWeight: 600,
							fontSize: '0.875rem',
							textTransform: 'none',
							'&:hover': {
								backgroundColor: '#2f47d1',
							},
							'&.Mui-disabled': {
								backgroundColor: 'grey.400',
							}
						}}
					>
						{view === "email" ? (isPending ? 'Sending...' : 'Send Reset Link') : (isPending ? 'Resetting...' : 'Reset Password')}
					</Button>

					{/* Remember Password Link - Only show on email view */}
					{view === "email" && (
						<Box sx={{ textAlign: 'center', mt: 2 }}>
							<Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
								Wait, I remember my password...{" "}
								<Link
									component="button"
									type="button"
									onClick={() => router.push(paths.auth.signIn)}
									sx={{
										color: '#465FFF',
										fontWeight: 600,
										textDecoration: 'none',
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										fontSize: '0.875rem',
										'&:hover': { color: '#2f47d1' }
									}}
								>
									Click here
								</Link>
							</Typography>
						</Box>
					)}
				</Stack>
			</form>
		</Box>
	);
}