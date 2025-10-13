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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";
import { z, z as zod } from "zod";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

export const schema = z
	.object({
		businessName: z.string().min(1, { message: "Business Name is required" }),
		categoryName: z.string().min(1, { message: "Category is required" }),
		startDate: z.string().min(1, { message: "Start Date is required" }),
		currency: z.string().min(1, { message: "Currency is required" }),
		logo: z.any().optional(), // Adjust this if you want to enforce a File or string

		website: z.string().url().optional(),
		phoneNumber: z.string().min(1, { message: "Business contact is required" }),

		country: z.string().min(1, { message: "Country is required" }),
		state: z.string().min(1, { message: "State is required" }),
		city: z.string().min(1, { message: "City is required" }),
		postalCode: z.string().min(1, { message: "Postal Code is required" }),

		companyDetails: z.string().min(1, { message: "Company Details are required" }),
		username: z.string().min(1, { message: "Username is required" }),

		email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email format" }),
		facebookLink: z.string().url().optional(),
		instagramLink: z.string().url().optional(),
		linkedinLink: z.string().url().optional(),
		youtubeLink: z.string().url().optional(),
		twitterLink: z.string().url().optional(),

		password: z.string().min(6, { message: "Password should be at least 6 characters" }),
		confirmPassword: z.string().min(6, { message: "Password should be at least 6 characters" }),

		acceptTerms: z.boolean().refine((value) => value === true, {
			message: "You must accept the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type Values = zod.infer<typeof schema>;
const defaultValues = {
	businessName: "",
	categoryName: "",
	startDate: "", // e.g., '2025-08-01'
	currency: "",
	logo: "",
	website: "",
	phoneNumber: "",
	country: "",
	state: "",
	city: "",
	postalCode: "",

	companyDetails: "",
	username: "",
	email: "",

	facebookLink: "",
	instagramLink: "",
	linkedinLink: "",
	youtubeLink: "",
	twitterLink: "",

	password: "",
	confirmPassword: "",
	acceptTerms: false,
} satisfies Values;

export function SignUpBussinessForm(): React.JSX.Element {
	const router = useRouter();

	const { checkSession } = useUser();

	const [isPending, setIsPending] = React.useState<boolean>(false);

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

    const convertToBase64 = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});

	const onSubmit = React.useCallback(
		async (values: Values): Promise<void> => {
			setIsPending(true);
let base64Logo = "";
if (values.logo instanceof File) {
			try {
				base64Logo = await convertToBase64(values.logo);
			} catch (error) {
				console.error("Failed to convert logo to base64:", error);
				setError("logo", { type: "manual", message: "Logo upload failed" });
				setIsPending(false);
				return;
			}
		} else if (typeof values.logo === "string") {
			base64Logo = values.logo;
		}

		const payload = {
			...values,
			logo: base64Logo,
		};
			const { error } = await authClient.signUpwithbusiness(payload);

			if (error) {
				setError("root", { type: "server", message: error });
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

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
					<Typography variant="h4">Sign up Bussiness</Typography>
				</div>
				<Typography color="text.secondary" variant="body2">
					Already have an account?{" "}
					<Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
						Sign in
					</Link>
				</Typography>
			</Stack>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					{/* Business Name */}
                    <div style={{ display: "flex", gap: "16px" }}>
					<Controller
						control={control}
						name="businessName"
						render={({ field }) => (
							<FormControl error={!!errors.businessName}>
								<InputLabel>Business Name</InputLabel>
								<OutlinedInput {...field} label="Business Name" />
								{errors.businessName && <FormHelperText>{errors.businessName.message}</FormHelperText>}
							</FormControl>
						)}
					/>

					{/* Category Name */}
					<Controller
						control={control}
						name="categoryName"
						render={({ field }) => (
							<FormControl error={!!errors.categoryName}>
								<InputLabel>Category</InputLabel>
								<OutlinedInput {...field} label="Category" />
								{errors.categoryName && <FormHelperText>{errors.categoryName.message}</FormHelperText>}
							</FormControl>
						)}
					/>
                    </div>
                     <div style={{ display: "flex", gap: "16px" }}>
					{/* User Info */}
					<Controller
						control={control}
						name="username"
						render={({ field }) => (
                            <TextField {...field} label="Username" error={!!errors.username} helperText={errors.username?.message} />
						)}
					/>

					<Controller
						control={control}
						name="email"
						render={({ field }) => (
                            <TextField
                            {...field}
                            label="Email"
                            type="email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
							/>
						)}
					/>
</div>



 <div style={{ display: "flex", gap: "16px" }}>

{/* Password Fields */}
					<Controller
						control={control}
						name="password"
						render={({ field }) => (
							<TextField
								{...field}
								label="Password"
								type="password"
								error={!!errors.password}
								helperText={errors.password?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="confirmPassword"
						render={({ field }) => (
							<TextField
								{...field}
								label="Confirm Password"
								type="password"
								error={!!errors.confirmPassword}
								helperText={errors.confirmPassword?.message}
							/>
						)}
					/>

</div>
 <div style={{ display: "flex", gap: "16px" }}>
				
					{/* Currency */}
					<Controller
						control={control}
						name="currency"
						render={({ field }) => (
							<FormControl error={!!errors.currency}>
								<InputLabel>Currency</InputLabel>
								<OutlinedInput {...field} label="Currency" />
								{errors.currency && <FormHelperText>{errors.currency.message}</FormHelperText>}
							</FormControl>
						)}
					/>
                    {/* Website */}
					<Controller
						control={control}
						name="website"
						render={({ field }) => (
							<TextField {...field} label="Website" error={!!errors.website} helperText={errors.website?.message} />
						)}
					/>

</div>
 
 <div style={{ display: "flex", gap: "16px" }}>
					
					{/* Business Contact */}
					<Controller
						control={control}
						name="phoneNumber"
						render={({ field }) => (
							<TextField
								{...field}
								label="Phone Number"
								error={!!errors.phoneNumber}
								helperText={errors.phoneNumber?.message}
							/>
						)}
					/>
                    <Controller
						control={control}
						name="country"
						render={({ field }) => (
							<TextField {...field} label="Country" error={!!errors.country} helperText={errors.country?.message} />
						)}
					/>
</div>
					{/* Address Info */}
                    <div style={{ display: "flex", gap: "16px" }}>
					

					<Controller
						control={control}
						name="state"
						render={({ field }) => (
							<TextField {...field} label="State" error={!!errors.state} helperText={errors.state?.message} />
						)}
					/>
                    <Controller
						control={control}
						name="city"
						render={({ field }) => (
							<TextField {...field} label="City" error={!!errors.city} helperText={errors.city?.message} />
						)}
					/>

 </div>

  <div style={{ display: "flex", gap: "16px" }}>
					
					<Controller
						control={control}
						name="postalCode"
						render={({ field }) => (
							<TextField
								{...field}
								label="Postal Code"
								error={!!errors.postalCode}
								helperText={errors.postalCode?.message}
							/>
						)}
					/>
                    <Controller
						control={control}
						name="facebookLink"
						render={({ field }) => (
                            <TextField
                            {...field}
                            label="Facebook Link"
                            error={!!errors.facebookLink}
                            helperText={errors.facebookLink?.message}
							/>
						)}
					/>
</div>




	{/* Social Links */}
					 <div style={{ display: "flex", gap: "16px" }}>

					<Controller
						control={control}
						name="instagramLink"
						render={({ field }) => (
							<TextField
								{...field}
								label="Instagram Link"
								error={!!errors.instagramLink}
								helperText={errors.instagramLink?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="linkedinLink"
						render={({ field }) => (
							<TextField
								{...field}
								label="LinkedIn Link"
								error={!!errors.linkedinLink}
								helperText={errors.linkedinLink?.message}
							/>
						)}
					/>
                    </div>
 <div style={{ display: "flex", gap: "16px" }}>
					<Controller
						control={control}
						name="youtubeLink"
						render={({ field }) => (
							<TextField
								{...field}
								label="YouTube Link"
								error={!!errors.youtubeLink}
								helperText={errors.youtubeLink?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="twitterLink"
						render={({ field }) => (
							<TextField
								{...field}
								label="Twitter Link"
								error={!!errors.twitterLink}
								helperText={errors.twitterLink?.message}
							/>
						)}
					/>
</div>


					<div style={{ display: "flex", gap: "16px" ,alignItems:"center"}}>
	{/* Start Date */}
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<TextField
								{...field}
								label="Start Date"
								type="date"
								InputLabelProps={{ shrink: true }}
								error={!!errors.startDate}
								helperText={errors.startDate?.message}
							/>
						)}
					/>

					{/* Logo Upload */}
					<Controller
						control={control}
						name="logo"
						render={({ field }) => (
							<>
								<input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
								{errors.logo && (
									<FormHelperText error>
										{typeof errors.logo?.message === "string" ? errors.logo.message : ""}
									</FormHelperText>
								)}
							</>
						)}
					/>
                    </div>

					{/* Accept Terms */}
					<Controller
						control={control}
						name="acceptTerms"
						render={({ field }) => (
							<>
								<FormControlLabel
									control={<Checkbox {...field} />}
									label={
										<>
											I accept the <Link href="#">terms and conditions</Link>
										</>
									}
								/>
								{errors.acceptTerms && <FormHelperText error>{errors.acceptTerms.message}</FormHelperText>}
							</>
						)}
					/>



{/* Company Details */}
<Controller
    control={control}
    name="companyDetails"
    render={({ field }) => (
        <TextField
            {...field}
            label="Company Details"
            multiline
            rows={4}
            error={!!errors.companyDetails}
            helperText={errors.companyDetails?.message}
        />
    )}
/>
				
					{/* Submit */}
					{errors.root && <Alert severity="error">{errors.root.message}</Alert>}
					<Button disabled={isPending} type="submit" variant="contained">
						Register Business
					</Button>
				</Stack>
			</form>
		</Stack>
	);
}
