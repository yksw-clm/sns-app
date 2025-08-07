import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import type { Post } from "@/lib/schemas/post";
import Image from "next/image";
import { LikeButton } from "./LikeButton";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

export function PostItem({ post }: { post: Post }) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center space-x-4">
					<Image
						src={post.author.image ?? "/default-avatar.svg"}
						alt="プロフィール画像"
						className="h-10 w-10 rounded-full"
						width={40}
						height={40}
					/>
					<div>
						<p className="font-bold">{post.author.name}</p>
						<p className="text-sm text-gray-500">
							{new Date(post.createdAt).toLocaleString()}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p>{post.content}</p>
				{post.imageUrl && (
					<Image
						src={post.imageUrl}
						alt="投稿画像"
						className="mt-4 rounded-lg"
						width={500}
						height={300}
					/>
				)}
			</CardContent>
			<CardFooter className="flex justify-between">
				<LikeButton postId={post.id} initialLikes={post._count.likes} />
				<div className="flex-grow">
					<CommentForm postId={post.id} />
					<CommentList postId={post.id} />
				</div>
			</CardFooter>
		</Card>
	);
}
