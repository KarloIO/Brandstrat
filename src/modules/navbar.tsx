'use client'
import React, { useEffect, useState } from "react";
import CheckSession from '@/lib/checkSession';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Spinner } from "@nextui-org/react";
import { AcmeLogo } from "@/public/AcmeLogo";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

import logo from '@/public/icons/lineas-solo.png';
import dashboard from '@/public/icons/layout-dashboard.svg';


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
                    console.log(user)
                    setUser(user)
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
    }, []);

    return (
        isLoading ? (
            null
        ) : (
            <Navbar className="" isBlurred={true} maxWidth="full">

                <NavbarBrand>
                    <Image src={logo} alt="logo" height={32} width={32}/>
                    <p className="font-bold text-inherit">Brandstrat</p>
                </NavbarBrand>

                <NavbarContent as="div" justify="end">

                    {userIsLoggedIn && (
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar
                                    isBordered
                                    as="button"
                                    className="transition-transform"
                                    color="warning"
                                    name="Jason Hughes"
                                    size="sm"
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Profile Actions" variant="flat">
                                <DropdownItem key="profile" className="h-14 gap-2" style={{ cursor: 'default' }}>
                                    <p className="font-semibold">Bienvenido</p>
                                    <p className="font-semibold">{user?.email}</p>
                                </DropdownItem>
                                <DropdownItem key="dashboard" className="">
                                    <div className="w-full h-full flex flex-row gap-1">
                                        <Image src={dashboard} className="" alt="icon" width={20} height={20}/>
                                        <p className="font-normal">Dashboard</p>
                                    </div>
                                </DropdownItem>
                                <DropdownItem key="logout" color="danger" onClick={() => handleSignOut()}>
                                    Cerrar Sesion
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    )}

                </NavbarContent>

            </Navbar>
        )
    );
}
