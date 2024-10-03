"use client"

import React, { useState, useEffect } from "react"
import { BackgroundLines } from "@/components/ui/background-lines"
import { Card, CardContent } from "@/components/ui/card"
import "../../app/globals.css";
import { Button } from "@/components/ui/button";

const targetDate = new Date('2024-10-13T00:00:00')

function getTimeLeft() {
  const difference = +targetDate - +new Date()
  const timeLeft = {}

  if (difference > 0) {
    timeLeft.days = Math.floor(difference / (1000 * 60 * 60 * 24))
    timeLeft.hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    timeLeft.minutes = Math.floor((difference / 1000 / 60) % 60)
    timeLeft.seconds = Math.floor((difference / 1000) % 60)
  }

  return timeLeft
}

export default function BackgroundLinesDemo() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const isOnboarded=localStorage.getItem('onboardedUser');
    if(!isOnboarded){
        window.location.href="/";
    }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 py-10 bg-black">
      <h2 className="bg-clip-text text-slate-300 text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
       Lenscape 📸 <br />.
      </h2>
      <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-500 dark:text-neutral-400 text-center mb-8 ">
         Let your inner creativity spark out, with Lenscape. 🚀
      </p>
      <Card className="bg-white/10 backdrop-blur-lg border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold text-center text-neutral-400 dark:text-neutral-200 mb-4">
            Countdown to Launch
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-neutral-200 dark:text-white">
                  {value}
                </div>
                <div className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 capitalize">
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button className="mt-8 bg-white/10 z-[999] text-neutral-100 ransition-colors duration-300 cursor-pointer" size="lg">
          Want to participate? Click here!
        </Button>
    </BackgroundLines>
    
  )
}