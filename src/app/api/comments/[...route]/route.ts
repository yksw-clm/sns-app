import { authMiddleware } from "@/lib/authMiddleware";
import type { HonoEnv } from "@/lib/hono";
import { createCommentSchema } from "@/lib/schemas/comment";
import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const prisma = new PrismaClient();
const app = new Hono<HonoEnv>().basePath("/api/comments");

const router = app
	.post(
		"/",
		authMiddleware,
		zValidator("json", createCommentSchema),
		async (c) => {
			const userId = c.get("userId");
			const { content, postId } = c.req.valid("json");

			try {
				// 投稿が存在するか確認
				const postExists = await prisma.post.findUnique({
					where: { id: postId },
				});
				if (!postExists) {
					return c.json({ error: "指定された投稿が存在しません" }, 404);
				}

				const newComment = await prisma.comment.create({
					data: {
						content,
						postId,
						authorId: userId,
					},
					include: {
						author: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				});
				return c.json(newComment, 201);
			} catch (error) {
				console.error("コメントの作成中にエラーが発生:", error);
				return c.json({ error: "コメントの作成に失敗しました" }, 500);
			}
		},
	)
	.delete("/:id", authMiddleware, async (c) => {
		const userId = c.get("userId");
		const { id } = c.req.param();

		try {
			const comment = await prisma.comment.findUnique({
				where: { id },
			});

			if (!comment) {
				return c.json({ error: "指定されたコメントが存在しません" }, 404);
			}
			if (comment.authorId !== userId) {
				return c.json({ error: "コメントの削除権限がありません" }, 403);
			}

			await prisma.comment.delete({
				where: { id },
			});

			return c.json({ message: "コメントが削除されました" }, 200);
		} catch (error) {
			console.error("コメントの削除中にエラーが発生:", error);
			return c.json({ error: "コメントの削除に失敗しました" }, 500);
		}
	});

export const POST = handle(router);
export const DELETE = handle(router);
export type CommentRoutes = typeof router;
