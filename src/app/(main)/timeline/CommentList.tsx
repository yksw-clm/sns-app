"use client";

import { client } from "@/lib/hono";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

export function CommentList({ postId }: { postId: string }) {
	const { data: post, error } = useSWR(`/api/posts/${postId}`, async () => {
		const res = await client.api.posts[":id"].$get({ param: { id: postId } });
		if (!res.ok) {
			throw new Error("投稿の取得に失敗しました");
		}
		return await res.json();
	});

	if (error)
		return <p className="text-red-500">コメントの取得に失敗しました</p>;
	if (!post) return <p>読み込み中...</p>;

	const comments = post.comments;

	return (
		<div className="mt-4 space-y-4">
			{comments?.map((comment) => (
				<div key={comment.id} className="flex items-start space-x-4">
					<Link href={`/profile/${comment.author.id}`}>
						<Image
							src={comment.author.image ?? "/default-avatar.svg"}
							alt="プロフィール画像"
							className="h-8 w-8 rounded-full"
							width={32}
							height={32}
						/>
					</Link>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<Link href={`/profile/${comment.author.id}`}>
								<p className="font-bold">{comment.author.name}</p>
							</Link>
							<p className="text-sm text-gray-500">
								{new Date(comment.createdAt).toLocaleString()}
							</p>
						</div>
						<p>{comment.content}</p>
					</div>
				</div>
			))}
		</div>
	);
}
