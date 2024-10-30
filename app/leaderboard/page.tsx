"use client"

import React, { useState, useEffect } from "react"
import { BackgroundLines } from "@/components/ui/background-lines"
import { Card, CardContent } from "@/components/ui/card"

import "../../app/globals.css";

export default function Leaderboard() {

  return (
    <BackgroundLines className="flex items-center justify-center w-full min-h-screen flex-col px-4 py-6 sm:py-10 bg-black">
      <h2 className="bg-clip-text text-slate-300 text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans py-2 sm:py-4 md:py-6 lg:py-10 relative z-20 font-bold tracking-tight">
        Lenscape Leaderboard 📸 <br className="sm:hidden" />.
      </h2>
      <Card className="bg-white/10 backdrop-blur-lg border-none shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-neutral-400 dark:text-neutral-200 mb-3 sm:mb-4">
        LeaderBoard Coming Soon! 🚀
          </h3>

        </CardContent>
      </Card>
    </BackgroundLines>
  )
}
