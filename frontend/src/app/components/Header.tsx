"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { motion } from "framer-motion"
import { User, LogOut, ChevronDown, Menu, X, Shield, BarChart3 } from "lucide-react"
import { profile, auth_logout } from "@/src/app/var"

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavLinkClick = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const accessToken = Cookies.get("access_token")
    setUserToken(accessToken || null)
  }, [])

  const handleSignOut = async () => {
    try {
      const accessToken = Cookies.get("access_token")
      if (accessToken) {
        const response = await fetch(auth_logout, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.error("Logout API failed", await response.json())
        }
      }
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      // Clear cookies
      Cookies.remove("email")
      Cookies.remove("access_token")
      // Redirect to the login page
      router.push("/login")
    }
  }

  useEffect(() => {
    // Fetch profile information from the API
    const fetchProfile = async () => {
      const accessToken = Cookies.get("access_token")

      if (!accessToken) {
        console.error("No access token found.")
        return
      }

      try {
        setUserToken(accessToken)
        const response = await fetch(profile, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const res = await response.json()
          if (res.success) {
            setEmail(res.data.email)
          } else {
            console.error(res.message || "Error retrieving profile data.")
          }
        } else {
          const errorData = await response.json()
          console.error(errorData.message || "Failed to fetch profile data.")
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    }

    fetchProfile()
  }, [])

  return (
    <header className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-1 shadow-lg">
                <Image
                  src="/headerLogo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Argochain
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Test Scanner</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="https://test-scanner.devolvedai.com/top-100-holder-wallets-addresses"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Top 100 Accounts</span>
            </Link>

            {/* Profile Section */}
            <div className="relative">
              {userToken ? (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mr-2">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="mr-1">Profile</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-800 dark:text-gray-200">User Profile</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{email}</div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/myaccount"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Shield className="mr-2 h-4 w-4 text-purple-500" />
                      My Account
                    </Link>
                  </div>

                  <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-700 dark:text-gray-300 focus:outline-none" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        >
          <div className="px-4 py-3 space-y-3">
            <Link
              href="https://test-scanner.devolvedai.com/top-100-holder-wallets-addresses"
              onClick={handleNavLinkClick}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md w-full justify-center"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Top 100 Accounts
            </Link>

            {userToken ? (
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                <div className="px-4 py-2">
                  <div className="font-medium text-gray-800 dark:text-gray-200">User Profile</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</div>
                </div>

                <Link
                  href="/myaccount"
                  onClick={handleNavLinkClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Shield className="mr-2 h-4 w-4 text-purple-500" />
                  My Account
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={handleNavLinkClick}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm w-full justify-center"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}

export default Header
