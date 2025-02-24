"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "./Login_Form";

export default function VerifyPage() {
    return (
        <main className="bg-[#ffffff] min-h-screen bg-cover bg-center">
            <section className="max-w-full sm:max-w-lg mx-auto min-h-screen grid">
                <Suspense fallback={<p>Loading...</p>}>
                    <VerifyEmailContent />
                </Suspense>
            </section>
        </main>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || '';

    return <LoginForm email={email} />;
}
