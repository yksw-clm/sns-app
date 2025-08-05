"use client";

import { useForm } from "react-hook-form";
import { type RegisterSchema, registerSchema } from "@/lib/schemas/auth";
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

	const form = useForm<RegisterSchema>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: RegisterSchema) {
		try {
			const res = await client.api.auth.register.$post({ json: values });
			if (!res.ok) {
				const data = await res.json();
				if (res.status === 409) {
					form.setError("email", { type: "manual", message: data.error });
					return;
				}
				toast.error("ユーザー登録に失敗しました。もう一度お試しください。");
				return;
			}
			toast.success("ユーザー登録が完了しました。");
			setIsAuthenticated(true);
			router.push("/profile/edit");
		} catch {
			toast.error("ユーザー登録に失敗しました。もう一度お試しください。");
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>新規登録</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>名前</FormLabel>
									<FormControl>
										<Input placeholder="山田太郎" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
							登録する
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<p className="text-sm text-gray-600">
					すでにアカウントをお持ちですか？
					<Link href="/login" className="text-blue-500 hover:underline">
						ログイン
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
