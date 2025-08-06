"use client";

import { client } from "@/lib/hono";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { isAuthenticated, isLoading, setIsAuthenticated, setIsLoading } =
		useAuthStore();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await client.api.auth.refresh.$get();
				if (res.ok) {
					setIsAuthenticated(true);
					setIsLoading(false);
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

		if (isLoading) {
			checkAuth();
		} else if (!isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, isLoading, router, setIsAuthenticated, setIsLoading]);

	if (isLoading || !isAuthenticated) {
		return (
			<div className="flex h-screen items-center justify-center">
				読み込んでいます...
			</div>
		);
	}

	return <div className="p-4">{children}</div>;
}
