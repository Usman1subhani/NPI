"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Button,
	FormControl,
	FormHelperText,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
	Paper,
	CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z as zod } from "zod";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

type Step = "SendOtp" | "verifyOtp" | "setNewPassword";

const otpSchema = zod.object({ otp: zod.string().min(4, "OTP must be at least 4 digits") });
const newPasswordSchema = zod
	.object({
		password: zod.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: zod.string().min(6, "Confirm password required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});
const fullSchema = zod.object({
	otp: zod.string().optional(),
	password: zod.string().optional(),
	confirmPassword: zod.string().optional(),
});
type FormValues = zod.infer<typeof fullSchema>;

export function SecureResetPasswordForm(): React.JSX.Element {
	const [step, setStep] = React.useState<Step>("SendOtp");
	const [isPending, setIsPending] = React.useState(false);
	const [rootError, setRootError] = React.useState<string | null>(null);
	const token = localStorage.getItem("auth-token");
	const user = localStorage.getItem("user");
	const email = user ? JSON.parse(user).email : "";
	const router = useRouter();
	const { checkSession } = useUser();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(fullSchema),
		defaultValues: { otp: "", password: "", confirmPassword: "" },
	});

	const setSchema = (newSchema: any) => {
		reset();
		(control as any)._options.resolver = zodResolver(newSchema);
	};

	const onSubmit = async (values: any) => {
		setIsPending(true);
		setRootError(null);

		try {
			if (step === "SendOtp") {
				const otpRes = await authClient.sendPasswordOtp({ email });
				if (otpRes.error) throw new Error(otpRes.error);
				setSchema(otpSchema);
				setStep("verifyOtp");
			} else if (step === "verifyOtp") {
				const { error } = await authClient.verifyPasswordOtp({ email, otp: values.otp });
				if (error) throw new Error(error);
				setSchema(newPasswordSchema);
				setStep("setNewPassword");
			} else if (step === "setNewPassword") {
				if (values.password !== values.confirmPassword) {
					setRootError("Passwords do not match");
					return;
				}
				const { error } = await authClient.updatePassword({ email, password: values.password });
				if (error) throw new Error(error);
				toast.success("Password updated successfully.");
				authClient.signOut();
				await checkSession?.();
				router.refresh();
			}
		} catch (err: any) {
			setRootError(err.message);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Paper
			elevation={3}
			sx={{
				maxWidth: 480,
				mx: "auto",
				mt: 8,
				p: 4,
				borderRadius: 3,
				boxShadow: "0px 6px 20px rgba(0,0,0,0.08)",
				border: "1px solid #e6e6e6",
			}}
		>
			<Stack spacing={4}>
				<Typography
					variant="h5"
					sx={{
						fontWeight: 700,
						textAlign: "center",
						color: "#161950",
						letterSpacing: 0.5,
					}}
				>
					{step === "SendOtp" && "Send OTP"}
					{step === "verifyOtp" && "Verify Email OTP"}
					{step === "setNewPassword" && "Set New Password"}
				</Typography>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={3}>
						{step === "SendOtp" && (
							<FormControl sx={{ mb: 1 }}>
								<InputLabel>Email</InputLabel>
								<OutlinedInput
									value={email}
									label="Email"
									type="email"
									readOnly
									sx={{
										borderRadius: "10px",
										backgroundColor: "#f9f9f9",
									}}
								/>
							</FormControl>
						)}

						{step === "verifyOtp" && (
							<Controller
								control={control}
								name="otp"
								render={({ field }) => (
									<FormControl error={Boolean(errors.otp)}>
										<InputLabel>OTP Code</InputLabel>
										<OutlinedInput
											{...field}
											label="OTP Code"
											sx={{
												borderRadius: "10px",
												backgroundColor: "#fff",
											}}
										/>
										{errors.otp && <FormHelperText>{errors.otp.message}</FormHelperText>}
									</FormControl>
								)}
							/>
						)}

						{step === "setNewPassword" && (
							<>
								<Controller
									control={control}
									name="password"
									render={({ field }) => (
										<FormControl error={Boolean(errors.password)}>
											<InputLabel>New Password</InputLabel>
											<OutlinedInput
												{...field}
												label="New Password"
												type="password"
												autoComplete="off"
												sx={{
													borderRadius: "10px",
													backgroundColor: "#fff",
												}}
											/>
											{errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
										</FormControl>
									)}
								/>
								<Controller
									control={control}
									name="confirmPassword"
									render={({ field }) => (
										<FormControl error={Boolean(errors.confirmPassword)}>
											<InputLabel>Confirm Password</InputLabel>
											<OutlinedInput
												{...field}
												label="Confirm Password"
												type="password"
												autoComplete="off"
												sx={{
													borderRadius: "10px",
													backgroundColor: "#fff",
												}}
											/>
											{errors.confirmPassword && (
												<FormHelperText>{errors.confirmPassword.message}</FormHelperText>
											)}
										</FormControl>
									)}
								/>
							</>
						)}

						{rootError && <Alert severity="error">{rootError}</Alert>}

						<Button
							type="submit"
							variant="contained"
							disabled={isPending}
							sx={{
								backgroundColor: "#161950",
								color: "#fff",
								py: 1.2,
								borderRadius: "10px",
								fontWeight: 600,
								"&:hover": { backgroundColor: '#004080' },
							}}
						>
							{isPending ? (
								<CircularProgress size={24} sx={{ color: "#fff" }} />
							) : step === "SendOtp" ? (
								"Send OTP"
							) : step === "verifyOtp" ? (
								"Verify OTP"
							) : (
								"Update Password"
							)}
						</Button>
					</Stack>
				</form>
			</Stack>
		</Paper>
	);
}
