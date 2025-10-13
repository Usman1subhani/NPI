"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
  
	// Form hook (we will change schema dynamically per step)
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(fullSchema), // only used for typing at init
		defaultValues: { otp: "", password: "", confirmPassword: "" },
	});

	// Step change helper
	const setSchema = (newSchema: any) => {
		reset(); // Clear old data
		(control as any)._options.resolver = zodResolver(newSchema); // Swap schema dynamically
	};

	const onSubmit = async (values: any) => {
		setIsPending(true);
		setRootError(null);

		try {
			if (step === "SendOtp") {
				// Send OTP automatically
				const otpRes = await authClient.sendPasswordOtp({ email: email });
				if (otpRes.error) throw new Error(otpRes.error);
				setSchema(otpSchema);
				setStep("verifyOtp");
			} else if (step === "verifyOtp") {
				const { error } = await authClient.verifyPasswordOtp({ email, otp: values.otp });
				if (error) throw new Error(error);
				setSchema(newPasswordSchema);
				setStep("setNewPassword");
			} else if (step === "setNewPassword") {
       if(values.password!=values.confirmPassword){
         setRootError("Passwords do not match");
         return;
       }
				const { error } = await authClient.updatePassword({ email, password: values.password });
				if (error) throw new Error(error);
				toast.success("Password updated successfully.");
				localStorage.removeItem("resetToken");
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
		<Stack spacing={4}>
			<Typography variant="h5">
				{step === "SendOtp" && "Send Otp"}
				{step === "verifyOtp" && "Verify Email OTP"}
				{step === "setNewPassword" && "Set New Password"}
			</Typography>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					{step === "SendOtp" && (
						<FormControl sx={{ mb: 2, display: "flex" }}>
							<InputLabel>Email</InputLabel>
							<OutlinedInput
								value={email} // set value from state
								label="Email"
								type="email"
								readOnly // make input non-editable
							/>
						</FormControl>
					)}

					{step === "verifyOtp" && (
						<Controller
							control={control}
							name="otp"
							render={({ field }) => (
								<FormControl error={Boolean(errors.otp)}>
									<InputLabel>OTP code</InputLabel>
									<OutlinedInput {...field} label="OTP code" />
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
										<InputLabel>New password</InputLabel>
										<OutlinedInput autoComplete="off" {...field} label="New password" type="password" />
										{errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
									</FormControl>
								)}
							/>
							<Controller
								control={control}
								name="confirmPassword"
								render={({ field }) => (
									<FormControl error={Boolean(errors.confirmPassword)}>
										<InputLabel>Confirm password</InputLabel>
										<OutlinedInput  autoComplete="off" {...field} label="Confirm password" type="password" />
										{errors.confirmPassword && <FormHelperText>{errors.confirmPassword.message}</FormHelperText>}
									</FormControl>
								)}
							/>
						</>
					)}

					{rootError && <Alert color="error">{rootError}</Alert>}
					<div style={{ display: "flex", justifyContent: "center" }}>
						<Button disabled={isPending} type="submit" sx={{ backgroundColor: "#0fb9d8" }} variant="contained">
							{step === "SendOtp" && "Send OTP"}
							{step === "verifyOtp" && "Verify OTP"}
							{step === "setNewPassword" && "Update Password"}
						</Button>
					</div>
				</Stack>
			</form>
		</Stack>
	);
}
