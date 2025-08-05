export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
			{children}
		</div>
	);
}
