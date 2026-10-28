import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

export async function requirePermission(permission: string) {
	const supabase = await createClient();

	const {data, error} = await supabase.auth.getClaims();
	if (error || !data?.claims) redirect("/auth/login");

	const {data: allowed, error: rpcError} = await supabase.rpc(
		"has_permission",
		{
			requested_permission: permission,
		},
	);
	if (rpcError) throw rpcError;

	if (allowed !== true) {
		const isOwner = data.claims.user_role === "owner";
		const home = isOwner ? "/owner/dashboard" : "/dashboard";
		const homePermission = isOwner
			? "dashboard.view.owner"
			: "dashboard.view.worker";

		redirect(
			permission === homePermission
				? "/auth/error?error=Access%20denied"
				: home,
		);
	}

	return {supabase};
}

export async function getRole() {
	const supabase = await createClient();
	const {data, error} = await supabase.auth.getClaims();
	if (error || !data?.claims) redirect("/auth/login");
	const user = data?.claims;
	const userRole = user?.user_role;
	return userRole;
}
