import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

//get db and schema
import { db } from "@/db";
import { googleCalendarConnections } from "@/db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await createClient();
  //var for the thingy token thing
  let refreshToken: string | null = null;

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    //capture data returned from session exchange - need ni sya for identity verification, authorization trust
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    refreshToken = data.session?.provider_refresh_token ?? null;
    //secret security key issued by Google - for cal api
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
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

    //if token exists, insert into google_tokens table in db
    if (refreshToken) {
      await db
        .insert(googleCalendarConnections)
        .values({ authUsersId: user.id, refreshToken })
        .onConflictDoUpdate({
          target: googleCalendarConnections.authUsersId,
          set: { refreshToken },
        });
    }
  }

  return NextResponse.redirect(new URL("/protected", url.origin));
}
