import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Logout() {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    supabaseClient.auth.signOut().then(() => {
      router.push("/");
    });
  }, [supabaseClient, router]);

  return <div></div>;
}
