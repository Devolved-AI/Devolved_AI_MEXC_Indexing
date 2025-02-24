"use client";

import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import LoginForm from "./Login_Form"


// const LoginForm = dynamic(() => import('./Login_Form'), { ssr: false });

export default function VerifyPage() {
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
