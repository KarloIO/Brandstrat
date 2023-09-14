'use client';
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import '@/styles/auth.css'

import Logo from '@/public/Brandstrat.png'

export default function SignUp() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [action, setAction] = useState("SignUp");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async () => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (!error) {
                console.log("Sign up successful!");
                router.push("/auth/callback");
            } else {
                console.log("Sign up error:", error.message);
            }
        } catch (error: any) {
            console.error("Sign up error:", error.message);
        }
    }

    const handleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (!error) {
                console.log("Sign in successful!");
                router.push("/auth/callback");
            } else {
                console.log("Sign in error:", error.message);
            }
        } catch (error: any) {
            console.error("Sign in error:", error.message);
        }
    }

    const toggleAction = () => {
        setAction(action === "SignUp" ? "SignIn" : "SignUp");
    }

    return (
        <div className="login-container">
            <div className="left-side">
                <div className="header">
                    <span>BRANDSTRAT CHAT BOT</span>
                </div>
                <div className="content">
                    <div className="header">
                        <span>{action === "SignUp" ? "Registrarse" : "Iniciar sesión"}</span>
                        <p>{action === "SignUp" ? "Crea una cuenta para acceder a la plataforma" : "Ingresa a tu cuenta para acceder a la plataforma"}</p>
                    </div>
                    <div className="form">
                        <div className="input">
                            <label>Correo electrónico</label>
                            <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="input">
                            <label>Contraseña</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="button">
                            <button onClick={action === "SignUp" ? handleSignUp : handleSignIn}>{action === "SignUp" ? "Registrarse" : "Iniciar sesión"}</button>
                        </div>
                    </div>
                    <div className="alternative">
                        <span>{action === "SignUp" ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}</span>
                        <p onClick={toggleAction}>{action === "SignUp" ? "Inicia sesión" : "Regístrate"}</p>
                    </div>
                </div>
                <div className="footer">
                    <span>© Brandstrat 2023</span>
                </div>
            </div>
            <div className="right-side">
                <Image src={Logo} alt="Logo" />
            </div>
        </div>
    );
}

export function SignOut() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                console.log("Sign out successful!");
                router.push("/auth");
            } else {
                console.log("Sign out error:", error.message);
            }
        } catch (error: any) {
            console.error("Sign out error:", error.message);
        }
    }

    return (
        <div className="button">
            <button onClick={handleSignOut}>Cerrar sesión</button>
        </div>
    );
}