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
		const userMetadata = user.user_metadata ?? {};
		const fullName = typeof userMetadata.full_name === "string" ? userMetadata.full_name.trim() : "";
		const fullNameParts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
		const firstName = (typeof userMetadata.first_name === "string" ? userMetadata.first_name.trim() : "") || fullNameParts[0] || "User";
		const lastName = (typeof userMetadata.last_name === "string" ? userMetadata.last_name.trim() : "") || fullNameParts.slice(1).join(" ") || "Profile";

		const {error: profileError} = await supabase.from("profiles").upsert(
			{
				id: user.id,
				first_name: firstName,
				last_name: lastName,
				phone_number: userMetadata.phone_number ?? null,
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
