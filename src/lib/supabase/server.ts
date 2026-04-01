import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from a Server Component where cookies
            // cannot be set. This can be safely ignored if middleware
            // refreshes user sessions.
          }
        },
      },
    },
  );
}

/**
 * Returns the authenticated user or null.
 * Uses getUser() (server-verified) — never trust getSession() alone.
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the authenticated user or redirects to login.
 * Use in Server Components / Server Actions that require auth.
 */
export async function requireUser(locale = "cs") {
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  return user;
}

/**
 * Creates a Supabase admin client using the service role key.
 * Bypasses RLS — use only in trusted server contexts (cron, webhooks).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
