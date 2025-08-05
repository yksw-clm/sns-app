import z from "zod";

export const updateProfileSchema = z.object({
	name: z
		.string({ error: "名前は必須です" })
		.min(1, "名前は必須です")
		.max(20, "名前は20文字以下で入力してください"),
	bio: z.string().max(160).optional(),
	image: z.url().optional(),
});
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
