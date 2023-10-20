'use server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function CheckSession() {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session }, } = await supabase.auth.getSession();

    const jsonSession = { session };

    return jsonSession;
}