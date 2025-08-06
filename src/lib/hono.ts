import { hc } from "hono/client";
import type { AuthRoutes } from "@/app/api/auth/[...route]/route";
import type { PostRoutes } from "@/app/api/posts/[...route]/route";
import type { CommentRoutes } from "@/app/api/comments/[...route]/route";
import type { UserRoutes } from "@/app/api/users/[...route]/route";
import type { LikeRoutes } from "@/app/api/likes/[...route]/route";

export const client = hc<
	AuthRoutes | UserRoutes | PostRoutes | CommentRoutes | LikeRoutes
>("/");

export type HonoEnv = {
	Variables: {
		userId: string;
	};
};
