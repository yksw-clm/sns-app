import z from "zod";

export const createPostSchema = z.object({
	content: z
		.string()
		.min(1, "投稿内容は必須です")
		.max(280, "投稿は280文字以下で入力してください"),
	imageUrl: z.url("画像のURL形式が正しくありません").optional(),
});
export type CreatePostSchema = z.infer<typeof createPostSchema>;

export type Post = {
	_count: {
		comments: number;
		likes: number;
	};
	author: {
		name: string;
		id: string;
		image: string | null;
	};
	content: string;
	imageUrl: string | null;
	id: string;
	createdAt: string;
	updatedAt: string;
	authorId: string;
};
