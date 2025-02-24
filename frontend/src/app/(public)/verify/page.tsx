"use client";

import dynamic from 'next/dynamic';
import { redirect, useSearchParams } from "next/navigation";


const LoginForm = dynamic(() => import('./Login_Form'), { ssr: false });

export default function Login() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || '';

    return (
        <main className="bg-[#ffffff] min-h-screen bg-cover bg-center">
            <section className="max-w-full sm:max-w-lg mx-auto min-h-screen grid">
                <LoginForm email={email} />
            </section>
        </main>
    );
}
