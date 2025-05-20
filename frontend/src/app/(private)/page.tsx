"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HomeSection from "@/src/app/components/HomeSection"
import { motion } from "framer-motion"
import { Search, Database, Cpu, Layers, Hexagon } from "lucide-react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("txnHash")
  const router = useRouter()
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([])

  // Generate particles for the background
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
    }))
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: (particle.y + particle.speed) % 100,
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      if (filter === "txnHash") {
        router.push(`/tx/${searchQuery}`)
      }
      if (filter === "block") {
        router.push(`/block/${searchQuery}`)
      }
      if (filter === "address") {
        router.push(`/address/${searchQuery}`)
      }
      if (filter === "token") {
        router.push(`/token/${searchQuery}`)
      }
    }
  }

  const getFilterIcon = () => {
    switch (filter) {
      case "txnHash":
        return <Database className="h-5 w-5" />
      case "address":
        return <Hexagon className="h-5 w-5" />
      case "block":
        return <Layers className="h-5 w-5" />
      case "token":
        return <Cpu className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  return (
    <main className="relative flex justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated particles background */}
      <div className="absolute inset-0 z-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500 opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
      </div>

      {/* Network lines background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(147, 51, 234, 0.5)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-4">
            Argochain Scanner
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Powered by Devolved AI to navigate the decentralized future
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center items-center mb-12"
        >
          <div className="w-full max-w-4xl backdrop-blur-md bg-black/30 p-6 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row items-center gap-2">
              <div className="relative w-full md:w-auto flex items-center">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                  {getFilterIcon()}
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-4 bg-gray-800/80 text-gray-200 rounded-l-lg w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-purple-500 border-r border-gray-700"
                >
                  <option value="txnHash">Txn Hash</option>
                  <option value="address">Address</option>
                  <option value="block">Block</option>
                  <option value="token">Token</option>
                </select>
              </div>

              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                  className="w-full px-4 py-4 bg-gray-800/80 text-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-r-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </motion.button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <HomeSection />
        </motion.div>
      </div>

      {/* Glowing orb effect */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl"></div>
    </main>
  )
}
