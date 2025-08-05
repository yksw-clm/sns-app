"use client";

import { useForm } from "react-hook-form";
import { type LoginSchema, loginSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { client } from "@/lib/hono";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);

	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginSchema) {
		try {
			const res = await client.api.auth.login.$post({ json: values });
			if (!res.ok) {
				const data = await res.json();
				form.setError("password", { type: "manual", message: data.error });
				return;
			}
			toast.success("ログインしました。");
			setIsAuthenticated(true);
			router.push("/timeline");
		} catch {
			toast.error("ログインに失敗しました。もう一度お試しください。");
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>ログイン</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>メールアドレス</FormLabel>
									<FormControl>
										<Input placeholder="email@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>パスワード</FormLabel>
									<FormControl>
										<Input type="password" placeholder="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							ログイン
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<p className="text-sm text-gray-600">
					アカウントをお持ちでないですか？
					<Link href="/register" className="text-blue-500 hover:underline">
						登録する
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
