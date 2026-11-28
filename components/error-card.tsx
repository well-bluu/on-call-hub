"use client";

import {useEffect} from "react";

export function ErrorCard({error, retry}: {error: Error & {digest?: string}; retry: () => void}) {
	useEffect(() => {
		console.error("Page error", error.digest ?? error);
	}, [error]);

	return (
		<div className="mx-auto mt-12 max-w-md rounded-xl border border-[#E5E5E5] bg-white p-8 text-center shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
			<h2 className="text-lg font-bold text-[#012247]">SOMETHING WENT WRONG</h2>
			<p className="mt-2 text-sm text-[#737373]">
				We couldn&apos;t load this page. Check your connection and try again.
			</p>
			<button type="button" onClick={retry} className="mt-6 rounded-lg bg-[#0050D3] px-6 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#003FA7]">
				Try again
			</button>
		</div>
	);
}
