"use client";

import { useState, Suspense, FormEvent, ChangeEvent, FC } from 'react';
import { useRouter } from 'next/navigation';
import { authEmail } from "@/app/var";
import toast, { Toaster } from 'react-hot-toast';
import newLogo from "@/logos/logo-2.png";
import Image from "next/image";

// Define a strong type for the authEmail response
interface AuthEmailResponse {
  success: boolean;
  message?: string;
}

const LoginContent: FC = () => {
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Send OTP to the provided email using the authEmail endpoint
      const response = await fetch(authEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as AuthEmailResponse;
      if (data.success) {
        toast.success("OTP sent to your email.");
        // Build the URL and navigate to the verify page
        const url = `/verify?email=${email}`;
        await router.push(url);
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <Image 
            priority 
            src={newLogo} 
            alt="Logo" 
            width={120} 
            height={80} 
            quality={70} 
            className="flex flex-col items-center justify-center mx-auto" 
          />
          <h1 className="text-4xl pb-0 mb-0 font-bold text-center leading-none tracking-tight text-gray-900 md:text-4xl">
            Sign In to Argochain Scanner
            <br />
          </h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              placeholder="you@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-6 text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const Login: FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LoginContent />
  </Suspense>
);

export default Login;
