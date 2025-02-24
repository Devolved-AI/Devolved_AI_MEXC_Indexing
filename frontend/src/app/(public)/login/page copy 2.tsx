"use client";

import Cookies from 'js-cookie';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth_login } from "@/app/var";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import newLogo from "@/logos/logo-2.png";
import Image from "next/image";

const LoginContent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmationToken = searchParams.get('confirmation_token');
    if (confirmationToken) {
      handleLoginWithToken(confirmationToken);
    }
  }, [searchParams]);

  const handleLoginWithToken = async (token: any) => {
    try {
      const response = await fetch(auth_login, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success) {
        Cookies.set('access_token', data.data.token, { expires: 29 });

        toast.success("Login successful!");
        router.push('/myaccount');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    const url = `/verify?email=${email}`;
    router.push(url);
    setTimeout(() => {
      window.history.replaceState(null, '', url);
    }, 100); // 100ms delay; adjust if necessary
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <Image priority src={newLogo} alt="Logo" width={120} height={80} quality={70} className="flex flex-col items-center justify-center mx-auto" />
            <h1 className="text-4xl pb-0 mb-0 font-bold text-center leading-none tracking-tight text-gray-900 md:text-4xl">
            Sign In to Argochain Scanner
              <br />
            </h1>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-6 text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

const Login = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LoginContent />
  </Suspense>
);

export default Login;
