import Image from "next/image";
import Link from "next/link";
import {Suspense} from "react";

import {createClient} from "@/lib/supabase/server";

async function ReturnLink() {
	const {data} = await (await createClient()).auth.getClaims();
	const role = data?.claims?.user_role;
	const href = role === "owner" ? "/owner/dashboard" : role === "worker" ? "/dashboard" : "/auth/login";

	return (
		<Link href={href} className="mt-6 inline-block rounded-lg bg-[#0050D3] px-6 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#003FA7]">
			{href === "/auth/login" ? "Go to login" : "Go to dashboard"}
		</Link>
	);
}

export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-[#012247] px-4">
			<div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
				<Image src="/pictures2/oncallHubLogo.png" alt="On Call Hub" width={111} height={122} className="mx-auto h-auto w-24" />
				<h1 className="mt-6 text-lg font-bold text-[#012247]">PAGE NOT FOUND</h1>
				<p className="mt-2 text-sm text-[#737373]">This page doesn&apos;t exist or was moved.</p>
				<Suspense fallback={null}>
					<ReturnLink />
				</Suspense>
			</div>
		</main>
	);
}
