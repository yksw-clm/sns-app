"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { client } from "@/lib/hono";

export default function Home() {
	const router = useRouter();
	const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await client.api.auth.refresh.$get();
				if (res.ok) {
					setIsAuthenticated(true);
					router.push("/timeline");
				} else {
					setIsAuthenticated(false);
					router.push("/login");
				}
			} catch (error) {
				setIsAuthenticated(false);
				router.push("/login");
			}
		};
		checkAuth();
	}, [router, setIsAuthenticated]);

	return (
		<div className="flex h-screen items-center jusitfy-center">
			読み込んでいます...
		</div>
	);
}
