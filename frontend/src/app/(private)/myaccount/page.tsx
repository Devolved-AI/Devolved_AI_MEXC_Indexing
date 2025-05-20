"use client"

import Link from 'next/link';
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { profile } from "@/src/app/var";

const MyAccount: React.FC = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [email, setEmail] = useState('');
  const [username, setUserName] = useState('');
  const [image, setImage] = useState('');
  const [firstLogin, setFirstLogin] = useState('');
  const [lastLogin, setLastLogin] = useState('');

  // Load data from local storage on component mount
  useEffect(() => {
    const storedContractAddress = localStorage.getItem('contractAddress');
    if (storedContractAddress) setContractAddress(storedContractAddress);
  }, []);

  useEffect(() => {
    // Fetch profile information from the API
    const fetchProfile = async () => {
      const accessToken = Cookies.get("access_token");

      if (!accessToken) {
        console.error("No access token found.");
        return;
      }

      try {
        const response = await fetch(profile, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            setUserName(res.data.name);
            setEmail(res.data.email);
            setImage(res.data.image);
            setFirstLogin(new Date(res.data.firstLogin).toUTCString());
            setLastLogin(new Date(res.data.lastLogin).toUTCString());
          } else {
            console.error(res.message || "Error retrieving profile data.");
          }
        } else {
          const errorData = await response.json();
          console.error(errorData.message || "Failed to fetch profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 py-8 px-4 md:px-16 lg:px-32">
      {/* Back to Home Link */}
      <Link href="/" passHref>
        <samp className="text-blue-600 hover:underline">Back Home</samp>
      </Link>

      <div className="mt-6 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6">
        {/* Account Overview */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-6">Account Overview</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <aside className="col-span-1 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-6">Others</h2>
            <ul className="space-y-3 mt-3">
              <li><Link href="/myverify_address" className="text-blue-600 hover:underline">Verify Address</Link></li>
            </ul>
          </aside>

          {/* Main Content */}
          <section className="col-span-2">
            <div className="bg-gray-50 dark:bg-gray-700 border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-4">Personal Info</h2>
              <p className="text-gray-700">Below are the username, email, and overview information for your account.</p>

              <div className="mt-4 space-y-4 text-gray-800 dark:text-gray-300">
                {/* <div>
                  <p className="font-medium ">Your Username:</p>
                  <p className="">{username}</p>
                </div> */}
                <div>
                  <p className="font-medium ">Your Email Address:</p>
                  <p className="">{email}</p>
                </div>
                <div>
                  <p className="font-medium ">First Login:</p>
                  <p className="">{firstLogin}</p>
                </div>
                <div>
                  <p className="font-medium ">Last Login:</p>
                  <p className="">{lastLogin}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
