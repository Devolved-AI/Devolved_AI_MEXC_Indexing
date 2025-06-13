"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Database, ArrowRight, Cpu, Hexagon, Clock, ExternalLink } from "lucide-react"

interface Block {
  block_number: number
  block_hash: string
  parent_hash: string
  state_root: string
  extrinsics_root: string
  timestamp: string
}

interface Transaction {
  tx_hash: string
  from_address: string
  to_address: string
  amount: string
  fee: string
  gas_fee: string
  timestamp: string
}

const HomeSection: React.FC = () => {
  const [latestBlocks, setLatestBlocks] = useState<Block[] | null>(null)
  const [latestTransactions, setLatestTransactions] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<"blocks" | "transactions">("blocks")

  useEffect(() => {
    // Fetch latest blocks and transactions in parallel
    const fetchData = async () => {
      try {
        setLoading(true)

        const [blocksResponse, transactionsResponse] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_BASE_URL + "/block/getLast10Blocks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(process.env.NEXT_PUBLIC_BASE_URL + "/transaction/getLast10Transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ])

        const blocksData = await blocksResponse.json()
        const transactionsData = await transactionsResponse.json()

        setLatestBlocks(blocksData.blocks.length > 0 ? blocksData.blocks : null)
        setLatestTransactions(transactionsData.transactions.length > 0 ? transactionsData.transactions : null)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLatestBlocks(null)
        setLatestTransactions(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const shorten = (hash: string | undefined) => {
    if (!hash) return "N/A"
    return `${hash.slice(0, 4)}...${hash.slice(-5)}`
  }

  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse">
            Syncing with blockchain...
          </p>
          <p className="text-sm text-gray-400">Fetching latest network data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto pt-6 lg:pt-12">
      {/* Section Header with Glowing Effect */}
      <div className="mb-8 text-center md:text-left">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400"
        >
          Argochain Explorer
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-300 text-sm md:text-base"
        >
          Real-time data powered by Devolved AI analytics
        </motion.p>
      </div>

      {/* Mobile Tab Selector (visible on small screens) */}
      <div className="md:hidden mb-6 flex rounded-lg overflow-hidden backdrop-blur-md bg-black/30 border border-purple-500/30">
        <button
          onClick={() => setActiveTab("blocks")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === "blocks" ? "bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white" : "text-gray-300"
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Blocks</span>
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === "transactions"
              ? "bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white"
              : "text-gray-300"
          }`}
        >
          <ArrowRight className="h-4 w-4" />
          <span>Transactions</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 md:space-x-8">
        {/* Latest Blocks Section */}
        <AnimatePresence mode="wait">
          {(activeTab === "blocks" || window.innerWidth >= 768) && (
            <motion.div
              key="blocks"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="w-full md:w-1/2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Database className="mr-2 h-5 w-5 text-purple-400" />
                  Latest Blocks
                </h3>
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
              </div>
              <div className="backdrop-blur-md bg-black/30 border border-purple-500/30 rounded-xl overflow-hidden shadow-lg shadow-purple-500/10">
                {latestBlocks ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700/30">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Block
                          </th>
                          <th className="px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            <Clock className="inline h-3 w-3 mr-1" /> Age
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {latestBlocks.map((block, index) => (
                          <motion.tr
                            key={index}
                            variants={itemVariants}
                            className="hover:bg-purple-900/20 transition-colors duration-150"
                          >
                            <td className="px-4 py-4">
                              <Link
                                href={`/block/${block.block_number}`}
                                className="flex items-center text-[#D91A9C] hover:text-pink-400 transition-colors"
                              >
                                <div className="mr-3 p-2 rounded-lg bg-purple-900/30 flex items-center justify-center">
                                  <Cpu className="h-4 w-4 text-purple-400" />
                                </div>
                                <span className="font-medium">{block.block_number}</span>
                                <ExternalLink className="ml-2 h-3 w-3 opacity-70" />
                              </Link>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-300">{formatTimestamp(block.timestamp)}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No blocks found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Latest Transactions Section */}
          {(activeTab === "transactions" || window.innerWidth >= 768) && (
            <motion.div
              key="transactions"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="w-full md:w-1/2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <ArrowRight className="mr-2 h-5 w-5 text-pink-400" />
                  Latest Transactions
                </h3>
                <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></div>
              </div>
              <div className="backdrop-blur-md bg-black/30 border border-purple-500/30 rounded-xl overflow-hidden shadow-lg shadow-purple-500/10">
                {latestTransactions ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700/30">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Txn Hash
                          </th>
                          <th className="px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            From
                          </th>
                          <th className="px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            To
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {latestTransactions.map((txn, index) => (
                          <motion.tr
                            key={index}
                            variants={itemVariants}
                            className="hover:bg-pink-900/20 transition-colors duration-150"
                          >
                            <td className="px-4 py-4">
                              <Link
                                href={`/tx/${txn.tx_hash}`}
                                className="flex items-center text-[#D91A9C] hover:text-pink-400 transition-colors"
                              >
                                <div className="mr-3 p-2 rounded-lg bg-pink-900/30 flex items-center justify-center">
                                  <Hexagon className="h-4 w-4 text-pink-400" />
                                </div>
                                <span className="font-medium">{shorten(txn.tx_hash)}</span>
                                <ExternalLink className="ml-2 h-3 w-3 opacity-70" />
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <Link
                                href={`/address/${txn.from_address}`}
                                className="text-[#D91A9C] hover:text-pink-400 transition-colors"
                              >
                                {shorten(txn.from_address)}
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <Link
                                href={`/address/${txn.to_address}`}
                                className="text-[#D91A9C] hover:text-pink-400 transition-colors"
                              >
                                {shorten(txn.to_address)}
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No transactions found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Network Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Network Status", value: "Active", icon: <div className="h-2 w-2 rounded-full bg-green-500"></div> },
          { label: "Block Time", value: "3.2s", icon: <Clock className="h-4 w-4 text-cyan-400" /> },
          {
            label: "Transactions",
            value: latestTransactions?.length || "0",
            icon: <ArrowRight className="h-4 w-4 text-pink-400" />,
          },
          {
            label: "Latest Block",
            value: latestBlocks?.[0]?.block_number || "N/A",
            icon: <Database className="h-4 w-4 text-purple-400" />,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="backdrop-blur-md bg-black/30 border border-purple-500/30 rounded-lg p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{stat.label}</span>
              {stat.icon}
            </div>
            <span className="text-lg font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default HomeSection
