"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import {
	updateProfileSchema,
	type UpdateProfileSchema,
} from "@/lib/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { PutBlobResult } from "@vercel/blob";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditProfilePage() {
	const router = useRouter();
	const [file, setFile] = useState<File | null>(null);

	const form = useForm<UpdateProfileSchema>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: "",
			bio: "",
		},
	});

	async function onSubmit(values: UpdateProfileSchema) {
		let imageUrl: string | null = null;

		if (file) {
			try {
				const res = await fetch(`/api/avatar/upload?filename=${file.name}`, {
					method: "POST",
					body: file,
				});
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error || "画像のアップロードに失敗しました");
				}
				imageUrl = ((await res.json()) as PutBlobResult).url;
			} catch (error) {
				toast.error(`画像のアップロード中にエラーが発生: ${error}`);
				return;
			}
		}

		try {
			const res = await client.api.users.profile.$put({
				json: { ...values, image: imageUrl ?? undefined },
			});
			if (!res.ok) {
				toast.error(
					"プロフィールの更新に失敗しました。もう一度お試しください。",
				);
				return;
			}
			toast.success("プロフィールが更新されました。");
			router.push("/timeline");
		} catch (error) {
			console.error("プロフィールの更新中にエラーが発生:", error);
			toast.error("プロフィールの更新に失敗しました。もう一度お試しください。");
		}
	}

	return (
		<div className="flex justify-center">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle>プロフィールを編集</CardTitle>
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
											<Input placeholder="山田 太郎" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel>自己紹介</FormLabel>
										<FormControl>
											<Textarea placeholder="自己紹介..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="image"
								render={() => (
									<FormItem>
										<FormLabel>プロフィール画像</FormLabel>
										<FormControl>
											<Input
												type="file"
												accept="image/*"
												onChange={(e) =>
													setFile(e.target.files ? e.target.files[0] : null)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit">保存</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
