import { authMiddleware } from "@/lib/authMiddleware";
import type { HonoEnv } from "@/lib/hono";
import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import z from "zod";

const updateProfleSchema = z.object({
	name: z
		.string({ error: "名前は必須です" })
		.min(1, "名前は必須です")
		.max(20, "名前は20文字以下で入力してください"),
	bio: z.string().max(160).optional(),
	image: z.url().optional(),
});

const prisma = new PrismaClient();
const app = new Hono<HonoEnv>().basePath("/api/users");

const router = app
	.get("/profile", authMiddleware, (c) => {
		const userId = c.get("userId");
		const user = prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true, bio: true, image: true },
		});

		if (!user) {
			return c.json({ error: "ユーザーが見つかりません" }, 404);
		}
		return c.json(user, 200);
	})
	.put(
		"/profile",
		authMiddleware,
		zValidator("json", updateProfleSchema),
		async (c) => {
			const userId = c.get("userId");
			const data = c.req.valid("json");

			try {
				const updatedUser = await prisma.user.update({
					where: { id: userId },
					data,
					select: { id: true, name: true, bio: true, image: true },
				});
				return c.json(updatedUser, 200);
			} catch (error) {
				console.error("ユーザー更新中にエラーが発生:", error);
				return c.json({ error: "ユーザーの更新に失敗しました" }, 500);
			}
		},
	)
	.get("/:id", async (c) => {
		const { id } = c.req.param();
		const user = await prisma.user.findUnique({
			where: { id },
			select: { id: true, name: true, bio: true, image: true, createdAt: true },
		});

		if (!user) {
			return c.json({ error: "ユーザーが見つかりません" }, 404);
		}
		return c.json(user, 200);
	});

export const GET = handle(router);
export const PUT = handle(router);
export type UserRoutes = typeof router;
