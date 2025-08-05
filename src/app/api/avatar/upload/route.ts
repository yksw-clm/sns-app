import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

// ファイルアップロードのルートを定義
export const POST = async (request: NextRequest) => {
	const { searchParams } = new URL(request.url);
	const filename = searchParams.get("filename");

	if (!filename || !request.body) {
		return NextResponse.json(
			{ message: "No file to upload." },
			{ status: 400 },
		);
	}

	// Vercel Blobにファイルをアップロード
	const blob = await put(filename, request.body, {
		access: "public",
		allowOverwrite: true,
	});
	// JSONレスポンスを返す
	return NextResponse.json(blob);
};
