import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { HonoEnv } from "./hono";

const ACCESS_TOKEN_SECRET =
	process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	const accessToken = getCookie(c, "access_token");
	if (!accessToken) {
		return c.json({ error: "認証が必要です" }, 401);
	}

	try {
		const decoded = await verify(accessToken, ACCESS_TOKEN_SECRET);
		if (!decoded || !decoded.sub) {
			return c.json({ error: "認証が無効です" }, 401);
		}
		c.set("userId", decoded.sub as string);
	} catch (error) {
		console.error("認証トークンの検証中にエラーが発生:", error);
		return c.json({ error: "認証が無効です" }, 401);
	}

	await next();
});
