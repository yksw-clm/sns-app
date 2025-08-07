"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/hono";
import {
	createCommentSchema,
	type CreateCommentSchema,
} from "@/lib/schemas/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export function CommentForm({ postId }: { postId: string }) {
	const { mutate } = useSWRConfig();
	const form = useForm<CreateCommentSchema>({
		resolver: zodResolver(createCommentSchema),
		defaultValues: {
			content: "",
			postId,
		},
	});

	async function onSubmit(values: CreateCommentSchema) {
		try {
			const res = await client.api.comments.comment.$post({
				json: values,
			});

			if (!res.ok) {
				toast.error("コメントの投稿に失敗しました");
				return;
			}

			toast.success("コメントを投稿しました");
			form.reset();

			mutate(`/api/posts/${postId}`);
			mutate("/api/posts/list");
		} catch (error) {
			console.error("コメントの投稿中にエラーが発生:", error);
			toast.error("コメントの投稿に失敗しました");
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex w-full items-start gap-2"
			>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem className="flex-grow">
							<Input placeholder="コメントを追加..." {...field} />
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					投稿
				</Button>
			</form>
		</Form>
	);
}
