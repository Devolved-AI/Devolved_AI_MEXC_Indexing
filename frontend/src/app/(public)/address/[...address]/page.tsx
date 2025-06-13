"use client"

import { useState, useEffect } from "react"
import ClipboardJS from "clipboard"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
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
    <div className="mt-0 container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Address Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-2">
          Address Details
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="text-sm">
            <Hexagon className="inline-block h-4 w-4 mr-1 text-purple-500" />
            {address?.slice(0, 12)}...{address?.slice(-8)}
          </span>
          <button
            className="copy-btn inline-flex items-center text-xs text-gray-500 hover:text-purple-500 transition-colors"
            data-clipboard-text={address}
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Copy
          </button>
          {copySuccess && <span className="text-xs text-green-500 animate-pulse">Copied {copySuccess}</span>}
        </div>
      </motion.div>

      {/* Balance Card */}
      {balance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mr-4">
                  <Wallet className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Account Balance</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {balance !== "Balance not found" ? (
                      <>
                        {convertToFixedPrecision(balance)}{" "}
                        <span className="text-sm font-medium text-purple-500">AGC</span>
                      </>
                    ) : (
                      "Balance not found"
                    )}
                  </p>
                </div>
              </div>
              <div className="hidden md:block h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {transactionData ? (
          <>
            {paginateData().map((block, blockIndex) => (
              <motion.div
                key={blockIndex}
                variants={itemVariants}
                className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden"
              >
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <Database className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <Link
                          href={`/block/${block.block_number}`}
                          className="text-lg font-semibold text-gray-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                          Block #{block.block_number}
                        </Link>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(block.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        {block.transactions.length} Transaction{block.transactions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {block.transactions.map((transaction, txIndex) => (
                    <div
                      key={txIndex}
                      className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Transaction Hash */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Hexagon className="h-3 w-3 mr-1" />
                            Transaction Hash
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/tx/${transaction.tx_hash}`}
                              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                            >
                              {transaction.tx_hash.slice(0, 10)}...{transaction.tx_hash.slice(-5)}
                              <ExternalLink className="inline-block h-3 w-3 ml-1" />
                            </Link>
                            <button
                              className="copy-btn inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
                              data-clipboard-text={transaction.tx_hash}
                              title="Copy transaction hash"
                            >
                              <Clipboard className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Method */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Cpu className="h-3 w-3 mr-1" />
                            Method
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {transaction.methodName || "Unknown Method"}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Amount
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {convertToFixedPrecision(transaction.amount)}{" "}
                            <span className="text-xs text-purple-500">AGC</span>
                          </div>
                        </div>

                        {/* From Address */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            From
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/address/${transaction.from_address}`}
                              className={`text-sm font-medium ${
                                transaction.from_address === address
                                  ? "text-pink-600 dark:text-pink-400"
                                  : "text-purple-600 dark:text-purple-400"
                              } hover:text-purple-800 dark:hover:text-purple-300 transition-colors`}
                            >
                              {transaction.from_address.slice(0, 10)}...{transaction.from_address.slice(-5)}
                              {transaction.from_address === address && <span className="ml-1 text-xs">(self)</span>}
                            </Link>
                            <button
                              className="copy-btn inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
                              data-clipboard-text={transaction.from_address}
                              title="Copy from address"
                            >
                              <Clipboard className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* To Address */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            To
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/address/${transaction.to_address}`}
                              className={`text-sm font-medium ${
                                transaction.to_address === address
                                  ? "text-pink-600 dark:text-pink-400"
                                  : "text-purple-600 dark:text-purple-400"
                              } hover:text-purple-800 dark:hover:text-purple-300 transition-colors`}
                            >
                              {transaction.to_address.slice(0, 10)}...{transaction.to_address.slice(-5)}
                              {transaction.to_address === address && <span className="ml-1 text-xs">(self)</span>}
                            </Link>
                            <button
                              className="copy-btn inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
                              data-clipboard-text={transaction.to_address}
                              title="Copy to address"
                            >
                              <Clipboard className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Gas Fee */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <GasPump className="h-3 w-3 mr-1" />
                            Gas Fee
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {convertToFixedPrecision(transaction.gas_fee)}{" "}
                            <span className="text-xs text-purple-500">AGC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-between items-center mt-8"
            >
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg 
                  bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </button>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage}
                {transactionData && (
                  <span className="text-gray-500 dark:text-gray-500">
                    {" "}
                    of {Math.ceil(transactionData.length / ITEMS_PER_PAGE)}
                  </span>
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={transactionData && currentPage * ITEMS_PER_PAGE >= transactionData.length}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                  bg-gradient-to-r from-purple-600 to-pink-600 text-white
                  hover:from-purple-700 hover:to-pink-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-8 text-center"
          >
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ExternalLink className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Transactions Found</h3>
            <p className="text-gray-500 dark:text-gray-400">{error || "This address has no transaction history."}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default TransactionDetailsByAddress
