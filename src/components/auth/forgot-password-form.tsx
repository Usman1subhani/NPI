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
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

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
				router.push("/auth/sign-in"); // optional: redirect automatically
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
		<Stack spacing={3} maxWidth={400} margin="auto" mt={5}>
			<Typography variant="h4">{view === "email" ? "Forgot Password" : "Reset Password"}</Typography>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					{view === "email" ? (
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<FormControl error={Boolean(errors.email)}>
									<InputLabel>Email</InputLabel>
									<OutlinedInput {...field} type="email" label="Email" />
									{errors.email && <FormHelperText>{errors.email?.message?.toString()}</FormHelperText>}
								</FormControl>
							)}
						/>
					) : (
						<>
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<FormControl error={Boolean(errors.password)}>
										<InputLabel>New Password</InputLabel>
										<OutlinedInput
											{...field}
											type={showPassword ? "text" : "password"}
											label="New Password"
											endAdornment={
												showPassword ? (
													<EyeIcon
														cursor="pointer"
														onClick={() => setShowPassword(false)}
														fontSize="var(--icon-fontSize-md)"
													/>
												) : (
													<EyeSlashIcon
														cursor="pointer"
														onClick={() => setShowPassword(true)}
														fontSize="var(--icon-fontSize-md)"
													/>
												)
											}
										/>
										{errors.password && <FormHelperText>{errors.password?.message?.toString()}</FormHelperText>}
									</FormControl>
								)}
							/>
							<Controller
								name="confirmPassword"
								control={control}
								render={({ field }) => (
									<FormControl error={Boolean(errors.confirmPassword)}>
										<InputLabel>Confirm Password</InputLabel>
										<OutlinedInput {...field} type="password" label="Confirm Password" />
										{errors.confirmPassword && (
											<FormHelperText>{errors.confirmPassword?.message?.toString()}</FormHelperText>
										)}
									</FormControl>
								)}
							/>
						</>
					)}

					{error && <Alert severity="error">{error}</Alert>}
					{success && <Alert severity="success">{success}</Alert>}

					<Button type="submit" disabled={isPending} variant="contained" sx={{ backgroundColor: "#0fb9d8" }}>
						{view === "email" ? "Send Reset Link" : "Reset Password"}
					</Button>
				</Stack>
			</form>
		</Stack>
	);
}
