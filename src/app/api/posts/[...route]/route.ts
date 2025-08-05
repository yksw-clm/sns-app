import { authMiddleware } from "@/lib/authMiddleware";
import type { HonoEnv } from "@/lib/hono";
import { createPostSchema } from "@/lib/schemas/post";
import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const prisma = new PrismaClient();
const app = new Hono<HonoEnv>().basePath("/api/posts");

const router = app
	.post(
		"/list",
		authMiddleware,
		zValidator("json", createPostSchema),
		async (c) => {
			const userId = c.get("userId");
			const { content, imageUrl } = c.req.valid("json");

			try {
				const newPost = await prisma.post.create({
					data: {
						content,
						imageUrl,
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
				return c.json(newPost, 201);
			} catch (error) {
				console.error("投稿の作成中にエラーが発生:", error);
				return c.json({ error: "投稿の作成に失敗しました" }, 500);
			}
		},
	)
	.get("/list", async (c) => {
		try {
			const posts = await prisma.post.findMany({
				orderBy: {
					createdAt: "desc",
				},
				include: {
					author: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					_count: {
						select: {
							likes: true,
							comments: true,
						},
					},
				},
			});
			return c.json(posts, 200);
		} catch (error) {
			console.error("投稿の取得中にエラーが発生:", error);
			return c.json({ error: "投稿の取得に失敗しました" }, 500);
		}
	})
	.get("/:id", async (c) => {
		const { id } = c.req.param();
		try {
			const post = await prisma.post.findUnique({
				where: { id },
				include: {
					author: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					comments: {
						orderBy: {
							createdAt: "desc",
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
					},
					_count: {
						select: {
							likes: true,
							comments: true,
						},
					},
				},
			});
			if (!post) {
				return c.json({ error: "投稿が見つかりません" }, 404);
			}
			return c.json(post, 200);
		} catch (error) {
			console.error("投稿の取得中にエラーが発生:", error);
			return c.json({ error: "投稿の取得に失敗しました" }, 500);
		}
	})
	.delete("/:id", authMiddleware, async (c) => {
		const userId = c.get("userId");
		const { id } = c.req.param();

		try {
			const post = await prisma.post.findUnique({
				where: { id },
			});

			if (!post) {
				return c.json({ error: "投稿が見つかりません" }, 404);
			}
			if (post.authorId !== userId) {
				return c.json({ error: "この投稿を削除する権限がありません" }, 403);
			}

			await prisma.post.delete({
				where: { id },
			});

			return c.json({ message: "投稿が削除されました" }, 200);
		} catch (error) {
			console.error("投稿の削除中にエラーが発生:", error);
			return c.json({ error: "投稿の削除に失敗しました" }, 500);
		}
	});

export const GET = handle(router);
export const POST = handle(router);
export const DELETE = handle(router);
export type PostRoutes = typeof router;
