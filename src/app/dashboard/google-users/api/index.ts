"use client";

import { useEffect, useState } from "react";

export interface GoogleUser {
	id: number;
	name: string;
	role: string;
	email: string;
	profile: string | null;
	approved: boolean;
	createdAt: string;
}

export const useGoogleUsers = () => {
	const [users, setUsers] = useState<GoogleUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/super-admin/get-google-users`);
				if (!res.ok) throw new Error("Failed to fetch users");
				const data = await res.json();
				setUsers(data);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	// ✅ Approve user API call
	const approveUser = async (id: number) => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/super-admin/approve?id=${id}`, {
				method: "PATCH",
			});

			if (!res.ok) throw new Error("Failed to approve user");

			const updatedUser = await res.json();

			// ✅ Update user in local state
			setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, approved: true } : u)));

			return updatedUser;
		} catch (err: any) {
			console.error(err);
			throw err;
		}
	};

	return { users, loading, error, approveUser };
};
