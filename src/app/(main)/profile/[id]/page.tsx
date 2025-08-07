"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { client } from "@/lib/hono";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function ProfilePage() {
	const { id } = useParams();
	const { data: user, error } = useSWR(`/api/users/${id}`, async () => {
		const res = await client.api.users[":id"].$get({
			param: { id: id as string },
		});
		if (!res.ok) {
			throw new Error("ユーザー情報の取得に失敗しました");
		}
		return res.json();
	});

	const { data: currentUser } = useSWR("/api/users/profile", async () => {
		const res = await client.api.users.profile.$get();
		if (!res.ok) {
			return null;
		}
		return res.json();
	});

	if (error) return <div>エラーが発生しました</div>;
	if (!user) return <div>読み込み中...</div>;

	const isMyProfile = currentUser?.id === user.id;

	return (
		<div className="container mx-auto max-w-2xl">
			<Card>
				<CardHeader>
					<div className="flex items-center space-x-4">
						<Image
							src={user.image ?? "/default-avatar.svg"}
							alt="プロフィール画像"
							className="h-24 w-24 rounded-full"
							width={96}
							height={96}
						/>
						<div>
							<CardTitle>{user.name}</CardTitle>
							<p className="text-gray-500">{user.bio}</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isMyProfile && (
						<Link href="/profile/edit">
							<Button>プロフィールを編集</Button>
						</Link>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
