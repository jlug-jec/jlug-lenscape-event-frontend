"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Instagram, Linkedin } from "lucide-react"
import { FaFirefoxBrowser } from "react-icons/fa"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const Footer = () => {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-8 h-8 bg-blue-500/20 rounded-full blur-xl animate-pulse opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-8 h-8 bg-purple-500/20 rounded-full blur-xl animate-pulse opacity-10" />
      </div>

      <motion.footer
        className="relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Brand section */}
            <motion.div
              className="space-y-6"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* JLUG Logo */}
              <div className="flex items-center space-x-4">
                <img 
                  src="https://jlug.club/assets/JLUG-b26f7b6c.jpg" 
                  alt="JLUG Logo" 
                  className="w-20 h-20 rounded-full border-2 border-white/10"
                />
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  LENSCAPE 2024
                </h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                Join us for the most exciting photography event of the year. Capture moments, share experiences, and
                connect with fellow enthusiasts.
              </p>
            </motion.div>

            {/* Contact section */}
            <motion.div
              className="space-y-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Need Help?
              </h3>
              <Alert className="bg-white/5 border text-white border-white/10 backdrop-blur-sm">
                <AlertDescription className="text-lg font-light">
                  Having questions or facing issues? Reach out to us on{" "}
                  <a
                    href="https://www.instagram.com/jlug_jec/"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                  . We're here to help and excited to hear from you!
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>

          <motion.hr
            className="my-8 border-t border-white/10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          />

          {/* Social links and copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex space-x-6 mb-4 md:mb-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200, damping: 10 }}
            >
              <a
                href="https://jlug.club/"
                className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFirefoxBrowser size={24} />
              </a>
              <a
                href="https://www.instagram.com/jlug_jec/"
                className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://in.linkedin.com/in/jlug-jec-a099991b9"
                className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={24} />
              </a>
            </motion.div>

            <motion.div
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              &copy; {new Date().getFullYear()} LENSCAPE. All rights reserved.
            </motion.div>
          </div>

          {/* Made with love section */}
          <motion.div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart size={14} className="text-red-500" />
            </motion.div>
            <span>by JLUG Team</span>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}