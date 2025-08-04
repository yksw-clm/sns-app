import { Hono } from "hono";
import { handle } from "hono/vercel";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/authMiddleware";

// Honoアプリケーションのインスタンスを作成
const app = new Hono().basePath("/api/avatar");

// ファイルアップロードのルートを定義
app.post("/upload", authMiddleware, async (c) => {
	const request = c.req.raw; // 元のRequestオブジェクトを取得
	const { searchParams } = new URL(request.url);
	const filename = searchParams.get("filename");

	if (!filename || !request.body) {
		return c.json({ message: "No file to upload." }, 400);
	}

	// Vercel Blobにファイルをアップロード
	const blob = await put(filename, request.body, {
		access: "public",
	});

	// NextResponseを使ってJSONレスポンスを返す
	return NextResponse.json(blob);
});

export const POST = handle(app);
export type AvatarRoutes = typeof app;
