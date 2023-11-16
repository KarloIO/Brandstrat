'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input, Button } from "@nextui-org/react";

import Logo from '@/public/Brandstrat.png';

export default function SignUp() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [isVisible, setIsVisible] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    }

    const handleSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (!error) {
                console.log("Sign in successful!");
                router.push("api/auth/callback");
                router.push('/')
            } else {
                console.log("Sign in error:", error.message);
            }
        } catch (error: any) {
            console.error("Sign in error:", error.message);
        }
    }


    return (
        <div className="w-screen h-screen flex flex-row items-center justify-end p-6 bg-white gap-5">

            <div className="w-5/12 h-full flex flex-col items-center justify-center gap-4">

                <div className="header cursor-default">
                    <span className="text-2xl font-bold">Iniciar sesión</span>
                    <p className="text-md text-gray-500">Ingresa a tu cuenta para acceder a la plataforma</p>
                </div>

                <div className="w-80 h-auto flex flex-col gap-2">

                    <Input
                        isClearable
                        type="email"
                        label="Correo electrónico"
                        variant="bordered"
                        defaultValue=""
                        onClear={() => console.log("input cleared")}
                        className="max-h-12"
                        radius="sm"
                        onChange={e => setEmail(e.target.value)}
                        autoComplete='off'
                    />

                    <Input
                        label="Contraseña"
                        variant="bordered"
                        endContent={
                            <button className="focus:outline-none" type="button" onClick={toggleVisibility} />
                        }
                        type={isVisible ? "text" : "password"}
                        className="max-h-12"
                        radius="sm"
                        onChange={e => setPassword(e.target.value)}
                    />

                    <Button className="bg-black text-white text-md font-semibold hover:bg-[#EF7A17] rounded-md" onClick={handleSignIn}>Iniciar sesión</Button>

                </div>

            </div>

            <div className="auth relative border-2 border-[#D0D0D0] w-7/12 h-full rounded-lg bg-[#EFF0F3] overflow-hidden flex items-center justify-center">
                <Image src={Logo} alt="Logo" className="w-1/2 z-10" />
            </div>

        </div>
    );
}