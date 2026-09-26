import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const supabase = await createClient();

	if (code) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	const {
		data: {user},
	} = await supabase.auth.getUser();

	if (user) {
		const {error: profileError} = await supabase.from("profiles").upsert(
			{
				id: user.id,
				first_name: user.user_metadata?.first_name,
				last_name: user.user_metadata?.last_name,
				phone_number: user.user_metadata?.phone_number,
			},
			{
				onConflict: "id",
				ignoreDuplicates: true,
			},
		);

		if (profileError) {
			console.error("Profile creation failed:", profileError);
		}
	}

	return NextResponse.redirect(new URL("/protected", url.origin));
}
