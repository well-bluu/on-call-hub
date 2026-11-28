import {type EmailOtpType} from "@supabase/supabase-js";
import {redirect} from "next/navigation";
import {type NextRequest} from "next/server";

import {createClient} from "@/lib/supabase/server";

function safeNext(value: string | null): string {
	if (
		!value?.startsWith("/") ||
		value.startsWith("//") ||
		value.startsWith("/\\") ||
		/[\r\n\t]/.test(value)
	) {
		return "/";
	}
	// Location must be header-safe. Preserve URL delimiters and existing escapes.
	return value.replace(/[^!-~]+/gu, encodeURIComponent);
}

export async function GET(request: NextRequest) {
	const {searchParams} = new URL(request.url);
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const next = safeNext(searchParams.get("next"));

	if (token_hash && type) {
		const supabase = await createClient();

		const {error} = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});
		if (!error) {
			redirect(type === "invite" ? "/auth/update-password" : next);
		}
	}

	const message = type === "invite"
		? "This invitation is invalid or has expired."
		: "This confirmation link is invalid or has expired.";
	redirect(`/auth/error?error=${encodeURIComponent(message)}`);
}
