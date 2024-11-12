"use client"

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const CheckVerificationMailPage = () => {
  const params = useSearchParams()!;
  let email = params.get("email");

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12 bg-white">
      <div className="max-w-xl px-5 text-center">
        <h2 className="mb-2 text-[42px] font-bold text-zinc-800">
          Check your inbox
        </h2>
        <p className="mb-2 text-lg text-zinc-500">
          We are glad, that you’re with us ? We’ve sent you a verification link to the email address  <span className=" text-red-500">(Don&apos;t Forget to Check Your Spam Folder!)</span> 
          <span className="font-medium text-indigo-500"> {email}</span>.
        </p>
      </div>
    </section>
  );
};

export default CheckVerificationMailPage;