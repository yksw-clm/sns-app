import z from "zod";

export const registerSchema = z.object({
	email: z.email({ error: "メールアドレスの形式が正しくありません" }),
	name: z
		.string({ error: "名前は必須です" })
		.min(1, "名前は必須です")
		.max(20, "名前は20文字以下で入力してください"),
	password: z
		.string({ error: "パスワードは必須です" })
		.min(8, "パスワードは8文字以上で入力してください")
		.max(64, "パスワードは64文字以下で入力してください"),
});
export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
	email: z.email({ error: "メールアドレスの形式が正しくありません" }),
	password: z
		.string({ error: "パスワードは必須です" })
		.min(8, "パスワードは8文字以上で入力してください")
		.max(64, "パスワードは64文字以下で入力してください"),
});
export type LoginSchema = z.infer<typeof loginSchema>;
