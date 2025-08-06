import type { Post } from "@/lib/schemas/post";
import { PostItem } from "./PostItem";

export function PostList({ posts }: { posts: Post[] }) {
	return (
		<div className="mt-4 space-y-4">
			{posts.map((post) => (
				<PostItem key={post.id} post={post} />
			))}
		</div>
	);
}
