"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CheckVerificationMailContent = () => {
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const param_email = searchParams.get('email');
    if (param_email) {
      setEmail(param_email);
    }
  }, [searchParams]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12 bg-white">
      <div className="max-w-xl px-5 text-center">
        <h2 className="mb-2 text-[42px] font-bold text-zinc-800">Check your inbox</h2>
        <p className="mb-2 text-lg text-zinc-500">
          We are glad that you’re with us! We’ve sent you a verification link to the email address 
          <span className="text-red-500"> (Don't Forget to Check Your Spam Folder!)</span> 
          <span className="font-medium text-indigo-500"> {email}</span>.
        </p>
      </div>
    </section>
  );
};

const CheckVerificationMailPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CheckVerificationMailContent />
  </Suspense>
);

export default CheckVerificationMailPage;
