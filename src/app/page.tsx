"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { client } from "@/lib/hono";

export default function Home() {
	const router = useRouter();
	const { setIsAuthenticated, setIsLoading } = useAuthStore();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await client.api.auth.refresh.$get();
				if (res.ok) {
					setIsAuthenticated(true);
					setIsLoading(false);

					router.push("/timeline");
				} else {
					setIsAuthenticated(false);
					setIsLoading(false);
					router.push("/login");
				}
			} catch (error) {
				setIsAuthenticated(false);
				setIsLoading(false);
				router.push("/login");
			}
		};
		checkAuth();
	}, [router, setIsAuthenticated, setIsLoading]);

	return (
		<div className="flex h-screen items-center justify-center">
			読み込んでいます...
		</div>
	);
}
