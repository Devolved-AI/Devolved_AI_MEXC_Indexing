"use client"

import { useState } from 'react';

export default function PasswordRecovery() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showMessageScreen, setShowMessageScreen] = useState(false); // Toggle message screen
  const [error, setError] = useState('');

  const handlePasswordRecovery = async (e:any) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/confirm-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, confirmPassword }),
      });

      if (response.ok) {
        setShowMessageScreen(true); // Show message screen on success
      } else {
        setError('Failed to send password recovery email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        {showMessageScreen ? (
          // Message screen content
          <div>
            <h2 className="text-2xl font-bold text-center text-green-600">Successfull</h2>
            <p className="mt-4 text-sm p-2 bg-[#d4edda] rounded-lg text-gray-600 text-center">
            Password Reset Successfull
            </p>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-300 mb-2 text-left'>Hi,</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 mb-2 text-left">
              Please note that your password has been successfully reset
            </p>
          </div>
        ) : (
          // Password recovery form
          <div>
            <h2 className="text-3xl mb-4 font-bold text-center text-gray-800 dark:text-gray-300">New Password</h2>
            <p className="text-sm text-center p-2 bg-[#d4edda] dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              Please create a new password that you don't use on any other site.
            </p>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <form className="space-y-4 mt-6" onSubmit={handlePasswordRecovery}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  placeholder="Create new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 mt-6 text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
