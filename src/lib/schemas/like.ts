import z from "zod";

export const likeSchema = z.object({
	postId: z.cuid("投稿IDの形式が正しくありません"),
});
export type LikeSchema = z.infer<typeof likeSchema>;
