import { hc } from "hono/client";
import type { AuthRoutes } from "@/app/api/auth/[...route]/route";

export const client = hc<AuthRoutes>("/");
