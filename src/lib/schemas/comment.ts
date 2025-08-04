import z from "zod";

export const createCommentSchema = z.object({
	content: z
		.string()
		.min(1, "コメントは必須です")
		.max(200, "コメントは200文字以下で入力してください"),
	postId: z.cuid("投稿IDの形式が正しくありません"),
});
export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
