"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { Heart } from "lucide-react";

export function LikeButton({
	postId,
	initialLikes,
}: {
	postId: string;
	initialLikes: number;
}) {
	const { mutate } = useSWRConfig();
	const likesKey = `/api/posts/${postId}/likes`;
	const userLikedKey = `/api/likes/like?postId=${postId}`;

	const { data: likes } = useSWR(likesKey, null, {
		fallbackData: initialLikes,
	});

	const { data: userLiked, error: userLikedError } = useSWR(
		userLikedKey,
		async () => {
			const res = await client.api.likes.like.$get({ query: { postId } });
			if (!res.ok) {
				throw new Error("いいね情報の取得に失敗しました");
			}
			const data = await res.json();
			return data.liked;
		},
	);

	const handleLike = async () => {
		try {
			if (userLiked) {
				mutate(
					likesKey,
					(currentLikes: number | undefined) => (currentLikes || 0) - 1,
					false,
				);
				mutate(userLikedKey, false, false);
				await client.api.likes.like.$delete({ json: { postId } });
			} else {
				mutate(
					likesKey,
					(currentLikes: number | undefined) => (currentLikes || 0) + 1,
					false,
				);
				mutate(userLikedKey, true, false);
				await client.api.likes.like.$post({ json: { postId } });
			}
			mutate(likesKey);
			mutate(userLikedKey);
			mutate("/api/posts/list");
		} catch (error) {
			toast.error("いいねの操作に失敗しました");
			mutate(likesKey);
			mutate(userLikedKey);
		}
	};

	if (userLikedError) return <div>...</div>;

	return (
		<Button variant="ghost" size="sm" onClick={handleLike}>
			<Heart
				className={`mr-2 h-4 w-4 ${
					userLiked ? "fill-red-500 text-red-500" : ""
				}`}
			/>
			{likes}
		</Button>
	);
}
