import { authMiddleware } from "@/lib/authMiddleware";
import type { HonoEnv } from "@/lib/hono";
import { likeSchema } from "@/lib/schemas/like";
import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const prisma = new PrismaClient();
const app = new Hono<HonoEnv>().basePath("/api/likes");

const router = app
	.post("/", authMiddleware, zValidator("json", likeSchema), async (c) => {
		const userId = c.get("userId");
		const { postId } = c.req.valid("json");

		try {
			const postExits = await prisma.post.findUnique({
				where: { id: postId },
			});
			if (!postExits) {
				return c.json({ error: "指定された投稿が存在しません" }, 404);
			}

			const newLike = await prisma.like.create({
				data: {
					postId,
					userId,
				},
			});
			return c.json(newLike, 201);
		} catch (error) {
			if (error instanceof Error && error.message.includes("P2002")) {
				return c.json({ error: "すでにこの投稿にいいねしています" }, 409);
			}
			console.error("いいねの作成中にエラーが発生:", error);
			return c.json({ error: "いいねの作成に失敗しました" }, 500);
		}
	})
	.delete("/", authMiddleware, zValidator("json", likeSchema), async (c) => {
		const userId = c.get("userId");
		const { postId } = c.req.valid("json");

		try {
			await prisma.like.delete({
				where: {
					userId_postId: {
						userId,
						postId,
					},
				},
			});

			return c.json({ message: "いいねを取り消しました" }, 200);
		} catch (error) {
			if (error instanceof Error && error.message.includes("P2025")) {
				return c.json({ error: "指定された投稿にいいねが存在しません" }, 404);
			}
			console.error("いいねの削除中にエラーが発生:", error);
			return c.json({ error: "いいねの削除に失敗しました" }, 500);
		}
	});

export const POST = handle(router);
export const DELETE = handle(router);
export type LikeRoutes = typeof router;
