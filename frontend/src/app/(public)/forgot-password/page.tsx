"use client";

import { useState } from 'react';
import { send_reset_password_mail } from "@/app/var";
import toast, { Toaster } from 'react-hot-toast';

export default function PasswordRecovery() {
  const [email, setEmail] = useState('');
  const [showMessageScreen, setShowMessageScreen] = useState(false); // Toggle message screen
  const [error, setError] = useState('');

  const handlePasswordRecovery = async (e: any) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(send_reset_password_mail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const res = await response.json();

      if (res.success) {
        toast.success("Password recovery email sent successfully!");
        setShowMessageScreen(true); // Show message screen on success
      } else {
        toast.error("Failed to send password recovery email. Please try again.");
        setError('Failed to send password recovery email. Please try again.');
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        {showMessageScreen ? (
          // Message screen content
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Check Your Email</h2>
            <p className="mt-4 text-sm p-2 bg-[#011a27] border-[#044f75] border-2 rounded-lg text-[#6edff6] dark:text-[#6edff6] text-center">
              You've successfully requested a "Password Recovery".
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-2 text-left">
              If the email address belongs to a known account, a recovery email will be sent to you within the next few minutes.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-left">
              1. If you have yet to receive the "Password Recovery" email, please check your spam/junk email folders.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-left">
              2. Or you may request a new password reset.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              If you need any assistance, please <a href="https://devolvedai.com" className="text-blue-600 hover:underline dark:text-blue-400">contact us</a>.
            </p>
          </div>
        ) : (
          // Password recovery form
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Argochain Test Scanner Password Recovery</h2>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Enter your registered email address below, and we’ll send you a link to reset your password.
            </p>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <form className="space-y-4 mt-6" onSubmit={handlePasswordRecovery}>
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
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 mt-6 text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Recovery Email
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
