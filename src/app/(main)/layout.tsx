"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	return <div className="p-4">{children}</div>;
}
