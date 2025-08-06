"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import { createPostSchema, type CreatePostSchema } from "@/lib/schemas/post";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PutBlobResult } from "@vercel/blob";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export function CreatePostForm() {
	const [file, setFile] = useState<File | null>(null);
	const { mutate } = useSWRConfig();

	const form = useForm<CreatePostSchema>({
		resolver: zodResolver(createPostSchema),
		defaultValues: {
			content: "",
			imageUrl: "",
		},
	});

	async function onSubmit(values: CreatePostSchema) {
		let imageUrl: string | null = null;

		if (file) {
			try {
				const res = await fetch(`/api/avatar/upload?filename=${file.name}`, {
					method: "POST",
					body: file,
				});
				if (!res.ok) {
					throw new Error("画像のアップロードに失敗しました");
				}
				const blob = (await res.json()) as PutBlobResult;
				imageUrl = blob.url;
			} catch {
				toast.error("Error uploading image:");
				return;
			}
		}

		try {
			const res = await client.api.posts.list.$post({
				json: { ...values, imageUrl: imageUrl === null ? undefined : imageUrl },
			});
			if (!res.ok) {
				toast.error("投稿に失敗しました");
				return;
			}
			toast.success("投稿しました");
			form.reset();
			setFile(null);
			mutate("/api/posts/list");
		} catch {
			toast.error("投稿に失敗しました");
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<Textarea placeholder="いまどうしてる？" {...field} />
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center justify-between">
					<FormField
						control={form.control}
						name="imageUrl"
						render={({ field }) => (
							<FormItem>
								<Input
									type="file"
									accept="image/*"
									className="max-w-xs"
									{...field}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">投稿する</Button>
				</div>
			</form>
		</Form>
	);
}
