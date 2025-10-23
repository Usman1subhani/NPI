"use client";

import type { User } from "@/types/user";

function _generateToken(): string {
	const arr = new Uint8Array(12);
	globalThis.crypto.getRandomValues(arr);
	return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
}

// const user = {
//   id: 'USR-000',
//   avatar: '/assets/avatar.png',
//   firstName: 'Sofia',
//   lastName: 'Rivers',
//   email: 'sofia@devias.io',
// } satisfies User;

export interface SignUpParams {
	email: string;
	otp?: string;
}
export interface OtpSendParams {
	username: string;
	email: string;
	password: string;
	phone: number;
	otp?: string;
	terms: boolean;
}
export interface SignUpBusinessParams {
	businessName: string;
	categoryName: string;
	startDate: string; // format: YYYY-MM-DD (e.g., '2025-08-01')
	currency: string;
	logo?: string; // File for upload or URL if already uploaded
	website?: string;
	phoneNumber: string;

	// Location
	country: string;
	state: string;
	city: string;
	postalCode: string;

	// Details
	companyDetails?: string;
	username: string;
	email: string;

	// Social Media Links
	facebookLink?: string;
	instagramLink?: string;
	linkedinLink?: string;
	youtubeLink?: string;
	twitterLink?: string;

	// Authentication
	password: string;
	confirmPassword: string;

	// Terms
	acceptTerms: boolean;
}

export interface SignInWithOAuthParams {
	provider: "google" | "discord";
}

export interface SignInWithPasswordParams {
	email: string;
	password: string;
}

export interface ResetPasswordParams {
	currentPassword?: string;
	otp?: string;
	password?: string;
	email?: string;
}
export interface ForgotPasswordParams {
	email?: string;
	
}


class AuthClient {
	async signUp(_: SignUpParams): Promise<{ error?: string }> {
		// Make API request
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/users/admin-register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: _.email,

					otp: _.otp,
				}),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Sign up failed");
			}
			const token = data.token;
			localStorage.setItem("auth-token", token);
			localStorage.setItem("user", JSON.stringify(data.user));
		} catch (_err) {
			return { error: "Sign up failed" };
		}
		// We do not handle the API, so we'll just generate a token and store it in localStorage.

		return {};
	}

	async SendOtp(_: OtpSendParams): Promise<{ error?: string }> {
		// Make API request
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/users/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: _.username,
					email: _.email,
					password: _.password,
					phone: _.phone,
					terms: _.terms ? "true" : "false",
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				return { error: data.msg || data.error || "Sign up failed" };
			}

			return {};
			// const token= data.token;

			// localStorage.setItem('auth-token', token);
			// localStorage.setItem('user', JSON.stringify(data.user));
		} catch (_err) {
			return { error: "Sign up failed" };
		}
		// We do not handle the API, so we'll just generate a token and store it in localStorage.

		return {};
	}

	async signUpwithbusiness(_: SignUpBusinessParams): Promise<{ error?: string }> {
		// Make API request
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/users/vendor-register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					businessName: _.businessName,
					categoryName: _.categoryName,
					startDate: _.startDate,
					currency: _.currency,
					logo: _.logo,
					website: _.website,
					phoneNumber: _.phoneNumber,

					// Location
					country: _.country,
					state: _.state,
					city: _.city,
					postalCode: _.postalCode,

					// Details
					companyDetails: _.companyDetails,
					username: _.username,
					email: _.email,

					// Social Media Links
					facebookLink: _.facebookLink,
					instagramLink: _.instagramLink,
					linkedinLink: _.linkedinLink,
					youtubeLink: _.youtubeLink,
					twitterLink: _.twitterLink,

					// Authentication
					password: _.password,
					confirmPassword: _.confirmPassword,

					// Terms
					acceptTerms: _.acceptTerms,
				}),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Sign up bussiness failed");
			}
			const token = data.token;
			localStorage.setItem("auth-token", token);
			localStorage.setItem("user", JSON.stringify(data.user));
		} catch (_err) {
			return { error: "Sign up business failed" };
		}
		// We do not handle the API, so we'll just generate a token and store it in localStorage.

		return {};
	}
	async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
		return { error: "Social authentication not implemented" };
	}

	// async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
	// 	// Make API request
	// 	try {
	// 		const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/auth/users/login`, {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			body: JSON.stringify(params),
	// 		});
	// 		const data = await response.json();
	// 		if (!response.ok) {
	// 			throw new Error(data.error || "Login failed");
	// 		}
	// 		const token = data.user.token;
	// 		console.log("token", token);
	// 		localStorage.setItem("auth-token", token);
	// 		localStorage.setItem("user", JSON.stringify(data.user));
	// 		// Store token or perform any client-side session logic here
	// 		// For example: localStorage.setItem('token', data.token);
	// 	} catch (_err) {
	// 		return { error: "Invalid credentials" };
	// 	}

	// 	return {};
	// }
	async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
		// Use dummy test API for login during development
		try {
			const response = await fetch("http://192.168.18.136:4000/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || data.error || "Login failed");
			}

			// expected shape: { message, user: { id, email, name, role, token } }
			const token = data.user?.token;
			if (!token) throw new Error("No token returned from auth server");

			// Save auth token and full user object (including role)
			localStorage.setItem("auth-token", token);
			localStorage.setItem("user", JSON.stringify(data.user));
		} catch (err) {
			console.error("signInWithPassword error:", err);
			return { error: String((err as Error).message || "Invalid credentials") };
		}

		return {};
	}

	async sendForgotPasswordLink({ email }: ForgotPasswordParams): Promise<{ error?: string }> {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/auth/users/send-forgot-password-link`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }), // no payload needed if backend knows user email
			});

			if (!res.ok) {
				const data = await res.json();
				return { error: data.message || "Failed to send OTP" };
			}

			return {};
		} catch (err) {
			return { error: "Network error while sending OTP" };
		}
	}
	async forgotPassword({password,resetToken}: {password: string; resetToken: string}): Promise<{ error?: string }> {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/auth/users/forgot-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password, resetToken }),
			});

			if (!res.ok) {
				const data = await res.json();
				return { error: data.message || "Failed to forgot password" };
			}

			return {};
		} catch (err) {
			return { error: "Network error while forgot password" };
		}
	}

	async sendPasswordOtp(_: ResetPasswordParams = { email: "" }): Promise<{ error?: string }> {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/auth/users/send-password-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: _.email }), // no payload needed if backend knows user email
			});

			if (!res.ok) {
				const data = await res.json();
				return { error: data.message || "Failed to send OTP" };
			}

			return {};
		} catch (err) {
			return { error: "Network error while sending OTP" };
		}
	}

	async verifyPasswordOtp({ email, otp }: ResetPasswordParams): Promise<{ error?: string }> {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/auth/users/verify-password-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp }),
			});

			if (!res.ok) {
				const data = await res.json();
				return { error: data.message || "Invalid OTP" };
			}
            const resdata = await res.json();
            localStorage.setItem("resetToken", resdata.resetToken);
			return {};
		} catch (err) {
			return { error: "Network error while verifying OTP" };
		}
	}

	async updatePassword({ email, password }: ResetPasswordParams): Promise<{ error?: string }> {
		try {
			const resetToken = localStorage.getItem("resetToken");
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/auth/users/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, resetToken }),
			});

			if (!res.ok) {
				const data = await res.json();
				return { error: data.message || "Failed to update password" };
			}

			return {};
		} catch (err) {
			return { error: "Network error while updating password" };
		}
	}

	getUser(): { data?: User | null; error?: string } {
		// Make API request

		// We do not handle the API, so just check if we have a token in localStorage.
		const token = localStorage.getItem("auth-token");
		const userJson = localStorage.getItem("user");
		if (!token || !userJson) {
			return { data: null };
		}

		const parsedUser = JSON.parse(userJson);

		return {
			data: {
				id: parsedUser.id,
				// prefer an avatar property if available (from OAuth providers like Google)
				avatar: parsedUser.avatar || parsedUser.photoURL || parsedUser.picture || null,
				name: parsedUser.name,
				email: parsedUser.email,
				role: parsedUser.role,
			},
		};
	}

	async signOut(): Promise<{ error?: string }> {
		localStorage.removeItem("auth-token");
		localStorage.removeItem("user");
		return {};
	}
}

export const authClient = new AuthClient();
