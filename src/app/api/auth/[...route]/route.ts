import { type Context, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";
import bcrypt from "bcryptjs";
import { PrismaClient, type User } from "@prisma/client";
import { sign, verify } from "hono/jwt";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { handle } from "hono/vercel";
import type { HonoEnv } from "@/lib/hono";

const ACCESS_TOKEN_SECRET =
	process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret";
const REFRESH_TOKEN_SECRET =
	process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret";

const prisma = new PrismaClient();
const app = new Hono<HonoEnv>().basePath("/api/auth");

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "Strict" as const,
	path: "/",
};

const setTokenCookie = async (c: Context, user: User) => {
	const payload = {
		sub: user.id,
		iat: Math.floor(Date.now() / 1000),
	};
	const accesstoken = await sign(
		{ ...payload, exp: payload.iat + 60 * 15 },
		ACCESS_TOKEN_SECRET,
	);
	const refreshToken = await sign(
		{ ...payload, exp: payload.iat + 60 * 60 * 24 * 7 },
		REFRESH_TOKEN_SECRET,
	);
	setCookie(c, "access_token", accesstoken, {
		...cookieOptions,
		maxAge: 60 * 15,
	});
	setCookie(c, "refresh_token", refreshToken, {
		...cookieOptions,
		maxAge: 60 * 60 * 24 * 7,
	});
};

const router = app
	// ユーザー登録
	.post("/register", zValidator("json", registerSchema), async (c) => {
		const { email, name, password } = await c.req.json();

		try {
			// ユーザーがすでに存在するか確認
			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) {
				return c.json(
					{ error: "このメールアドレスはすでに登録されています" },
					409,
				);
			}

			// パスワードをハッシュ化して新しいユーザーを作成
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = await prisma.user.create({
				data: { email, name, password: hashedPassword },
			});

			// JWTトークンを生成してクッキーに設定
			await setTokenCookie(c, newUser);

			return c.json(
				{
					message: "ユーザー登録が成功しました",
					user: { id: newUser.id, email: newUser.email, name: newUser.name },
				},
				201,
			);
		} catch (error) {
			console.error("ユーザー登録中にエラーが発生:", error);
			return c.json({ error: "ユーザー登録に失敗しました" }, 500);
		}
	})
	// ログイン
	.post("/login", zValidator("json", loginSchema), async (c) => {
		const { email, password } = await c.req.json();

		try {
			// ユーザーをメールアドレスで検索
			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				return c.json(
					{ error: "メールアドレスまたはパスワードが正しくありません" },
					401,
				);
			}

			// パスワードを検証
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				return c.json(
					{ error: "メールアドレスまたはパスワードが正しくありません" },
					401,
				);
			}

			// JWTトークンを生成してクッキーに設定
			await setTokenCookie(c, user);

			return c.json(
				{
					message: "ログインに成功しました",
					user: { id: user.id, email: user.email, name: user.name },
				},
				200,
			);
		} catch (error) {
			console.error("ログイン中にエラーが発生:", error);
			return c.json({ error: "ログインに失敗しました" }, 500);
		}
	})
	// リフレッシュ
	.get("/refresh", async (c) => {
		const refreshToken = getCookie(c, "refresh_token");

		if (!refreshToken) {
			return c.json({ error: "認証が無効です" }, 401);
		}

		try {
			// トークンを検証
			const decoded = await verify(refreshToken, REFRESH_TOKEN_SECRET);
			if (!decoded || !decoded.sub) {
				return c.json({ error: "認証が無効です" }, 401);
			}

			// 新しいアクセストークンを生成
			const payload = {
				sub: decoded.sub,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 60 * 15,
			};
			const newAccessToken = await sign(payload, ACCESS_TOKEN_SECRET);

			// 新しいアクセストークンをクッキーに設定
			setCookie(c, "access_token", newAccessToken, {
				...cookieOptions,
				maxAge: 60 * 15,
			});

			return c.json({ message: "アクセストークンが更新されました" }, 200);
		} catch (error) {
			console.error("トークンの更新中にエラーが発生:", error);

			// エラーが発生した場合、cookieを削除して再ログインを促す
			deleteCookie(c, "access_token", cookieOptions);
			deleteCookie(c, "refresh_token", cookieOptions);

			return c.json(
				{ error: "トークンの更新に失敗したため、再ログインしてください" },
				500,
			);
		}
	})
	// ログアウト
	.post("/logout", async (c) => {
		// クッキーからトークンを削除
		deleteCookie(c, "access_token", cookieOptions);
		deleteCookie(c, "refresh_token", cookieOptions);

		return c.json({ message: "ログアウトしました" }, 200);
	});

export const GET = handle(router);
export const POST = handle(router);
export type AuthRoutes = typeof router;
