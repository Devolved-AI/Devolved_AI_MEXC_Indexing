"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Twitter,
  MessageCircle,
  Linkedin,
  Send,
  Globe,
  ChevronRight,
  Database,
  Cpu,
  Hexagon,
  Shield,
} from "lucide-react"

const Footer: React.FC = () => {
  const year = new Date().getFullYear()
  const [currentYear] = useState(year)

  const footerLinks = [
    { name: "Blocks", href: "#", icon: <Database className="h-4 w-4" /> },
    { name: "Transactions", href: "#", icon: <Hexagon className="h-4 w-4" /> },
    { name: "Top Accounts", href: "/top-100-holder-wallets-addresses", icon: <Cpu className="h-4 w-4" /> },
    { name: "API", href: "#", icon: <Shield className="h-4 w-4" /> },
  ]

  const socialLinks = [
    { name: "Website", href: "https://devolvedai.com", icon: <Globe className="h-5 w-5" /> },
    { name: "Twitter", href: "https://twitter.com/devolvedai", icon: <Twitter className="h-5 w-5" /> },
    { name: "Discord", href: "https://discord.com/invite/devolvedai", icon: <MessageCircle className="h-5 w-5" /> },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/devolvedai", icon: <Linkedin className="h-5 w-5" /> },
    { name: "Telegram", href: "https://t.me/devolvedai", icon: <Send className="h-5 w-5" /> },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-12 pb-6 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Logo and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-1 shadow-lg">
                <Image
                  src="/headerLogo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Argochain
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Test Scanner</span>
              </div>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Argochain Test Scanner is a Block Explorer and Analytics Platform for Argochain Testnet, powered by
              advanced AI to provide insights into blockchain data.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <span className="mr-2 text-purple-500">{link.icon}</span>
                    {link.name}
                    <ChevronRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target="_blank"
                  aria-label={link.name}
                  className="flex items-center justify-center h-10 w-10 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow"
                >
                  {link.icon}
                </Link>
              ))}
            </div>

            <div className="pt-4 space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">About DevolvedAI</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                DevolvedAI is building next-generation blockchain infrastructure with integrated AI capabilities. Visit
                our website to learn more about our projects.
              </p>
              <Link
                href="https://devolvedai.com"
                target="_blank"
                className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                Learn more
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} DevolvedAI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-70"></div>
    </footer>
  )
}

export default Footer
