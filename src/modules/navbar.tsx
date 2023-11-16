'use client'
import React, { useEffect, useState } from "react";
import CheckSession from '@/lib/checkSession';
import { Navbar, NavbarBrand, NavbarContent, DropdownItem, DropdownTrigger, Dropdown, Avatar } from "@nextui-org/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

import { IconBrandAsana, IconUser, IconSettings, IconArrowBarRight } from '@tabler/icons-react'

import logo from '@/public/icons/lineas-solo.png';


export default function NavigationBar() {
    const [user, setUser] = useState<any>()
    const router = useRouter();
    const [userIsLoggedIn, setUserIsLoggedIn] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (user !== null) {
                    setUser(user)
                    console.log(user);
                } else {
                    console.log(error)
                    setUser('')
                }
                setIsLoading(false);
            } catch (error) {
                console.log(error)
                setIsLoading(false);
            }
        }

        fetchUser()

    }, [supabase.auth])

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

    useEffect(() => {
        async function checkUserSession() {
            try {
                const result = await CheckSession();
                setUserIsLoggedIn(result.session);
                console.log(result);
            } catch (error) {
                console.error(error);
            }
        }

        checkUserSession();

        if (userIsLoggedIn === null) {
            router.push("/auth");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        isLoading ? (
            null
        ) : (
            <Navbar className="" isBlurred={true} maxWidth="full">

                <NavbarBrand>
                    <Image src={logo} alt="logo" height={32} width={32} />
                    <p className="font-bold text-inherit">Brandstrat</p>
                </NavbarBrand>

                <NavbarContent as="div" justify="end">

                    {userIsLoggedIn && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar src={undefined} alt="user" className="bg-[#E7E7E8] text-[#1F1F21] cursor-pointer" aria-label="user" name={user.email} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mr-2">
                                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                    <IconBrandAsana className='w-[16px]' />
                                    Panel de Control
                                </DropdownMenuItem>

                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => router.push(`/profile/${user.email}`)}>
                                        <IconUser className='w-[16px]' />
                                        Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <IconSettings className='w-[16px]' />
                                        Ajustes
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <IconArrowBarRight className='w-[16px]' />
                                    <button>Cerrar Sesion</button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                </NavbarContent>

            </Navbar>
        )
    );
}
