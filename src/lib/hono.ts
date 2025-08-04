import { hc } from "hono/client";
import type { AuthRoutes } from "@/app/api/auth/[...route]/route";
import type { PostRoutes } from "@/app/api/posts/[...route]/route";
import type { CommentRoutes } from "@/app/api/comments/[...route]/route";
import type { UserRoutes } from "@/app/api/users/[...route]/route";
import type { LikeRoutes } from "@/app/api/likes/[...route]/route";
import type { AvatarRoutes } from "@/app/api/avatar/upload/route";

export const client = hc<
	| AuthRoutes
	| UserRoutes
	| PostRoutes
	| CommentRoutes
	| LikeRoutes
	| AvatarRoutes
>("/");

export type HonoEnv = {
	Bindings: {
		ACCESS_TOKEN_SECRET: string;
		REFRESH_TOKEN_SECRET: string;
	};
	Variables: {
		userId: string;
	};
};
