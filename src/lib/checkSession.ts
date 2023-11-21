'use server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function CheckSession() {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session }, } = await supabase.auth.getSession();


        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (user !== null) {
                    const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', user.email)
                    .single()
                    return data;
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error)
                return null;
            }
        }

        const userData = await fetchUser()


    const jsonSession = { session, userData };

    return jsonSession;
}