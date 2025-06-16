"use client"

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ClipboardJS from 'clipboard';
import Link from 'next/link';
import { FiClipboard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import PageLayout from '../../../components/PageLayout';
import {
  Clipboard,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  Clock,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Hexagon,
  Cpu,
  DollarSign,
  FuelIcon as GasPump,
} from "lucide-react"

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../../public/block.json';

interface Transaction {
  tx_hash: string
  from_address: string
  to_address: string
  amount: string
  gas_fee: string
  method: string
  methodName?: string
}

interface Block {
  block_number: string
  timestamp: string
  transactions: Transaction[]
}

const ITEMS_PER_PAGE = 20

const TransactionDetailsByAddress = () => {
  const [transactionData, setTransactionData] = useState<Block[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const pathname = usePathname()
  const address = pathname?.split("/").pop()

  useEffect(() => {
    const clipboard = new ClipboardJS(".copy-btn")

    clipboard.on("success", (e) => {
      setCopySuccess(e.text.substring(0, 10) + "...")
      setTimeout(() => setCopySuccess(null), 2000)
      console.log(e)
    })

    clipboard.on("error", (e) => console.log(e))

    return () => clipboard.destroy()
  }, [])

  useEffect(() => {
    if (address) {
      fetchTransactionDetails(address)
      fetchBalance(address)
    }
  }, [address])

  const fetchTransactionDetails = async (address: string) => {
    try {
      setLoading(true)
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/transaction/getTransactionDetailsByAddress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()
      if (data.success) {
        const blocksWithMethodName = data.blocks.map((block: Block) => ({
          ...block,
          transactions: block.transactions.map((transaction) => ({
            ...transaction,
            methodName: transaction.method.split(".").pop() || "",
          })),
        }))
        setTransactionData(blocksWithMethodName.reverse())
        setError(null)
      } else {
        setTransactionData(null)
        setError("Transaction not found.")
      }
    } catch (err) {
      setTransactionData(null)
      setError("Transaction not found or an error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/transaction/getBalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })
      const data = await response.json()
      setBalance(data.success ? data.balance : "Balance not found")
    } catch (err) {
      setBalance("Balance not found")
      setError("Balance not found or an error occurred.")
    }
  }

  const convertToFixedPrecision = (amount: string, decimals = 18) => {
    try {
      const balanceBigInt = BigInt(amount) // Convert amount to BigInt
      const divisor = BigInt(1e18)
      const integerPart = balanceBigInt / divisor
      const fractionalPart = balanceBigInt % divisor

      // Calculate fractional part as a string with necessary precision
      let fractionalStr = fractionalPart.toString().padStart(18, "0").slice(0, decimals)

      // Remove trailing zeros from fractional part
      fractionalStr = fractionalStr.replace(/0+$/, "")

      // Return the result with fractional part only if it has significant digits
      return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString()
    } catch (error) {
      console.error("Invalid input for conversion:", error)
      return "0.0" // Default value if input is invalid
    }
  }

  const formatTimestamp = (timestamp: string) => {
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

  const paginateData = () => {
    if (!transactionData) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return transactionData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }

  const handleNextPage = () => {
    if (transactionData && currentPage * ITEMS_PER_PAGE < transactionData.length) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
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
            Syncing blockchain data...
          </p>
          <p className="text-sm text-gray-400">Fetching transaction details</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Address Details"
      loading={loading}
      error={error}
    >
      {/* Address Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Address Overview</h2>
          <div className="flex items-center space-x-2">
            <code className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {address}
            </code>
            <button
              className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              data-clipboard-text={address}
            >
              <FiClipboard className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-purple-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {balance ? convertToFixedPrecision(balance) : '0.0'} AGC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Transactions</h2>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {paginateData().map((block, blockIndex) => (
            <motion.div
              key={block.block_number}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-purple-500" />
                    <Link
                      href={`/block/${block.block_number}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Block #{block.block_number}
                    </Link>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(block.timestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {block.transactions.map((tx, txIndex) => (
                  <div key={tx.tx_hash} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {tx.methodName === 'transfer' ? (
                            <DollarSign className="h-5 w-5 text-green-500" />
                          ) : (
                            <Cpu className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/tx/${tx.tx_hash}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tx.methodName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {convertToFixedPrecision(tx.amount)} AGC
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fee: {convertToFixedPrecision(tx.gas_fee)} AGC
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        {transactionData && transactionData.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {Math.ceil(transactionData.length / ITEMS_PER_PAGE)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage * ITEMS_PER_PAGE >= transactionData.length}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default TransactionDetailsByAddress
