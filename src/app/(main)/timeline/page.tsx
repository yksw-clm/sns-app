"use client";

import { client } from "@/lib/hono";
import Image from "next/image";
import useSWR from "swr";
import { CreatePostForm } from "./CreatePostForm";
import type { Post } from "@/lib/schemas/post";
import { PostList } from "./PostList";

export default function TimelinePage() {
	const { data: user, error: userError } = useSWR(
		"/api/users/profile",
		async () => {
			const res = await client.api.users.profile.$get();
			if (!res.ok) {
				throw new Error("プロフィールの取得に失敗しました");
			}
			return await res.json();
		},
	);
	const { data: posts, error: postsError } = useSWR(
		"/api/posts/list",
		async () => {
			const res = await client.api.posts.list.$get();
			if (!res.ok) {
				throw new Error("投稿の取得に失敗しました");
			}
			const posts: Post[] = await res.json();
			return posts;
		},
	);

	if (userError || postsError) {
		return <div>エラーが発生しました</div>;
	}

	if (!user || !posts) {
		return <div>読み込み中...</div>;
	}

	return (
		<div className="container mx-auto max-w-2xl">
			<header className="flex items-center space-x-4 p-4">
				<Image
					src={user.image || "/default-avatar.svg"}
					alt="プロフィール画像"
					className="h-12 w-12 rounded-full"
					width={48}
					height={48}
				/>
				<div>
					<h1 className="text-xl font-bold">{user.name}</h1>
					<p className="text-sm text-gray-500">{user.bio}</p>
				</div>
			</header>
			<main className="p-4">
				<CreatePostForm />
				<PostList posts={posts} />
			</main>
		</div>
	);
}
