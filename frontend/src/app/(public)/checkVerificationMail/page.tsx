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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Check Your Inbox</h2>
            <p className="mt-4 text-sm p-2 bg-[#011a27] border-[#044f75] border-2 rounded-lg text-[#6edff6] dark:text-[#6edff6] text-center">
              Thank you for joining us! We’ve sent a verification link to: {email}
            </p>
            <p className="mt-2 text-sm text-red-500 dark:text-red-400 mb-2 text-left">
              Don’t forget to check your spam folder!
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              If you need any assistance, please <a href="https://devolvedai.com" className="text-blue-600 hover:underline dark:text-blue-400">contact us</a>.
            </p>
          </div>
      </div>
    </div>
  );
};

const CheckVerificationMailPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CheckVerificationMailContent />
  </Suspense>
);

export default CheckVerificationMailPage;
