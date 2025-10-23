"use client";
import { useEffect, useState } from "react";

export interface GoogleUser {
  id: string;
  name: string;
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
        const res = await fetch("http://192.168.18.136:4000/google-user");
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

  return { users, loading, error };
};
