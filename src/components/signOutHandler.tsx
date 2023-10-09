'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@nextui-org/react";
import { DropdownItem } from '@nextui-org/react'

export default function SignOut() {
    const [user, setUser] = useState('')
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (user!.id !== null) {
                    setUser(user!.id)
                } else {
                    setUser('')
                }
            } catch (error) {
                // console.log(error)
            }
        }

        fetchUser()

    })

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                console.log("Sign out successful!");
                router.push("/");
            } else {
                console.log("Sign out error:", error.message);
            }
        } catch (error: any) {
            console.error("Sign out error:", error.message);
        }
    }

    return (
        <DropdownItem key="logout" color="danger" onClick={() => handleSignOut()}>
        Log Out
    </DropdownItem>
    );
}