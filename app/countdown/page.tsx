"use client"

import React, { useState, useEffect } from "react"
import { BackgroundLines } from "@/components/ui/background-lines"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import "../../app/globals.css";
const targetDate = new Date('2024-10-13T00:00:00')

function getTimeLeft() {
  const difference = +targetDate - +new Date()
  const timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } = {}

  if (difference > 0) {
    timeLeft.days = Math.floor(difference / (1000 * 60 * 60 * 24))
    timeLeft.hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    timeLeft.minutes = Math.floor((difference / 1000 / 60) % 60)
    timeLeft.seconds = Math.floor((difference / 1000) % 60)
  }

  return timeLeft
}

export default function ResponsiveCountdown() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isParticipated, setIsParticipated] = useState(false)

  useEffect(() => {
    const onboardedUser = localStorage.getItem('onboardedUser') === 'true'
    const participantStatus = localStorage.getItem('isParticipant') === 'true'

    setIsOnboarded(onboardedUser)
    setIsParticipated(participantStatus)

    if (!onboardedUser) {
      window.location.href = "/"
    }

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <BackgroundLines className="flex items-center justify-center w-full min-h-screen flex-col px-4 py-6 sm:py-10 bg-black">
      <h2 className="bg-clip-text text-slate-300 text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans py-2 sm:py-4 md:py-6 lg:py-10 relative z-20 font-bold tracking-tight">
        Lenscape 📸 <br className="sm:hidden" />.
      </h2>
      <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg text-neutral-500 dark:text-neutral-400 text-center mb-4 sm:mb-6 lg:mb-8 px-4">
        Let your inner creativity spark out, with Lenscape. 🚀
      </p>
      <Card className="bg-white/10 backdrop-blur-lg border-none shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-neutral-400 dark:text-neutral-200 mb-3 sm:mb-4">
            Countdown to Launch
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-200 dark:text-white">
                  {value as React.ReactNode}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 capitalize">
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {isParticipated && (
        <Button
          className="mt-4 sm:mt-6 lg:mt-8 bg-white/10 z-[999] text-neutral-100 transition-colors duration-300 cursor-pointer text-sm sm:text-base"
          size="lg"
          onClick={() => { router.push('/profile') }}
        >
          Check your profile to upload posts!
        </Button>
      )}
      {!isParticipated && isOnboarded && (
        <Button
          className="mt-4 sm:mt-6 lg:mt-8 bg-white/10 z-[999] text-neutral-100 transition-colors duration-300 cursor-pointer text-sm sm:text-base"
          size="lg"
          onClick={() => { router.push('/onboarding') }}
        >
          Want to participate? Click here!
        </Button>
      )}
    </BackgroundLines>
  )
}