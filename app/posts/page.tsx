"use client"

import { useState, useMemo, useRef } from 'react'
import TinderCard from 'react-tinder-card'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Instagram, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import React from 'react'

import "../../app/globals.css"

interface Submission {
  id: string
  name: string
  college: string
  instagramHandle: string
  mediaUrl: string
  mediaType: 'image' | 'video'
}

const submissions: Submission[] = [
  { id: "1", name: "Alice Johnson", college: "State University", instagramHandle: "alice_captures", mediaUrl: "/placeholder.svg?height=600&width=400", mediaType: 'image' },
  { id: "2", name: "Bob Smith", college: "Tech Institute", instagramHandle: "bob_frames", mediaUrl: "https://example.com/sample-video.mp4", mediaType: 'video' },
  { id: "3", name: "Carol Williams", college: "Arts Academy", instagramHandle: "carol_lens", mediaUrl: "/placeholder.svg?height=600&width=400", mediaType: 'image' },
  { id: "4", name: "David Brown", college: "City College", instagramHandle: "david_shots", mediaUrl: "/placeholder.svg?height=600&width=400", mediaType: 'image' },
  { id: "5", name: "Eva Martinez", college: "Creative University", instagramHandle: "eva_visuals", mediaUrl: "https://example.com/another-video.mp4", mediaType: 'video' },
]

export default function LenscapeVoting() {
  const [currentIndex, setCurrentIndex] = useState(submissions.length - 1)
  const [lastDirection, setLastDirection] = useState<string | undefined>()
  const [isPlaying, setIsPlaying] = useState(false)
  const currentIndexRef = useRef(currentIndex)
  const videoRef = useRef<HTMLVideoElement>(null)

  const childRefs = useMemo(
    () =>
      Array(submissions.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    []
  )

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
    setIsPlaying(false)
  }

  const canGoBack = currentIndex < submissions.length - 1
  const canSwipe = currentIndex >= 0

  const swiped = (direction: string, nameToDelete: string, index: number) => {
    setLastDirection(direction)
    updateCurrentIndex(index - 1)
  }

  const outOfFrame = (name: string, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current)
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current.restoreCard()
    }
  }

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < submissions.length) {
      await childRefs[currentIndex].current.swipe(dir)
    }
  }

  const goBack = async () => {
    if (!canGoBack) return
    const newIndex = currentIndex + 1
    updateCurrentIndex(newIndex)
    await childRefs[newIndex].current.restoreCard()
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <h1 className="text-5xl font-bold mb-8 text-white tracking-wider">LENSCAPE</h1>
      <div className="relative w-full max-w-sm h-[600px]">
        <AnimatePresence>
          {submissions.map((submission, index) => (
            index >= currentIndex && (
              <TinderCard
                ref={childRefs[index]}
                key={submission.id}
                onSwipe={(dir) => swiped(dir, submission.name, index)}
                onCardLeftScreen={() => outOfFrame(submission.name, index)}
                className="absolute w-full h-[560px]"
                swipeRequirementType="position"
                swipeThreshold={100}
              >
                <motion.div
                  initial={{ scale: 0.8, rotateY: -180, opacity: 0 }}
                  animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                  exit={{ scale: 0.8, rotateY: 180, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full cursor-grab active:cursor-grabbing"
                  style={{ touchAction: 'none', perspective: '1000px' }}
                >
                  <Card className="overflow-hidden h-full shadow-xl rounded-xl bg-gray-800 border-gray-700">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="relative flex-grow">
                        {submission.mediaType === 'image' ? (
                          <img
                            src={submission.mediaUrl}
                            alt={`Submission by ${submission.name}`}
                            className="w-full h-full object-cover"
                            draggable="false"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              ref={videoRef}
                              src={submission.mediaUrl}
                              className="w-full h-full object-cover"
                              loop
                              muted
                            />
                            <button
                              onClick={togglePlay}
                              className="absolute bottom-4 right-4 bg-white bg-opacity-50 rounded-full p-2 transition-opacity hover:bg-opacity-75"
                            >
                              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </button>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                          <h2 className="text-2xl font-semibold text-white">{submission.name}</h2>
                          <p className="text-lg text-gray-300">{submission.college}</p>
                          <a
                            href={`https://instagram.com/${submission.instagramHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center mt-2 text-gray-300 hover:text-white transition-colors"
                          >
                            <Instagram className="w-5 h-5 mr-2" />
                            @{submission.instagramHandle}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <AnimatePresence>
                    {lastDirection === 'left' && index === currentIndex + 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full text-lg font-semibold shadow-lg"
                      >
                        Ignored
                      </motion.div>
                    )}
                    {lastDirection === 'right' && index === currentIndex + 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full text-lg font-semibold shadow-lg"
                      >
                        Good
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TinderCard>
            )
          ))}
        </AnimatePresence>
      </div>
      <div className="flex justify-center mt-8 space-x-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => swipe('left')}
          disabled={!canSwipe}
          className="bg-transparent hover:bg-red-900 text-red-500 border-red-500 hover:border-red-600"
        >
          <ChevronLeft className="h-6 w-6 mr-2" />
          Ignore
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => goBack()}
          disabled={!canGoBack}
          className="bg-transparent hover:bg-blue-900 text-blue-500 border-blue-500 hover:border-blue-600"
        >
          <RotateCcw className="h-6 w-6 mr-2" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => swipe('right')}
          disabled={!canSwipe}
          className="bg-transparent hover:bg-green-900 text-green-500 border-green-500 hover:border-green-600"
        >
          Good
          <ChevronRight className="h-6 w-6 ml-2" />
        </Button>
      </div>
    </div>
  )
}