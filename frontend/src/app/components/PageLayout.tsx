"use client";

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  loading?: boolean;
  error?: string | null;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  loading = false,
  error = null,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Gradient bar - moved to top and adjusted z-index */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-70 z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>
          
          {loading && (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && children}
        </motion.div>
      </div>
    </div>
  );
};

export default PageLayout; 