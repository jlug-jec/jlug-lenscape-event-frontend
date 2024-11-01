"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import React from 'react'
import { useState, useRef, useEffect } from 'react'
import TinderCard from 'react-tinder-card'
import ReactPlayer from 'react-player'
import { toast, ToastContainer } from 'react-toastify'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Heart, ThumbsDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { postApi } from "@/app/api/posts"

import { Submission } from '../types/post'
import { getOptimizedDriveUrl, getLocalStorageItem } from '@/lib/utils'





export default function LenscapeVoting() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastDirection, setLastDirection] = useState<string | undefined>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null)
  const [likedIndex, setLikedIndex] = useState<number | null>(null)
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({})
  const currentIndexRef = useRef(currentIndex)
  const videoRef = useRef<ReactPlayer>(null)
  const childRefs = useRef<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  const fetchData = async () => {
    try {
      let response = await postApi.getAllPosts();
      setSubmissions(response);
      setCurrentIndex(response.length - 1);
      childRefs.current = response.map(() => React.createRef());
      
      // Initialize loading states for all images
      const initialLoadingStates: {[key: string]: boolean} = {};
      response.forEach((submission: { type: string; _id: string | number }) => {
        if (submission.type.startsWith("image")) {
          initialLoadingStates[submission._id] = true;
        }
      });
      setImageLoadingStates(initialLoadingStates);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchData();
    const storedUserId = getLocalStorageItem('_id');
    if (storedUserId) {
      setUserId(storedUserId.replace(/^"|"$/g, ''));
    }
  }, []);

  const handleImageLoad = (submissionId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [submissionId]: false
    }));
  };

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canGoBack = currentIndex < submissions.length - 1
  const canSwipe = currentIndex >= 0

  const swiped = async (direction: string, nameToDelete: string, index: number) => {
    if(!userId){
      toast.error("You havent logged In, log in to continue")
      router.push("/")
      return
    }
    if(direction === 'right' && userId) {
      try {
        let response = await postApi.votePost(submissions[index]._id, userId);
        toast.success(response.message);
      } catch (error) {
        toast.error("Failed to vote post");
        router.push("/")
      }
    }
    setLastDirection(direction)
    updateCurrentIndex(index - 1)
    if (playingVideoIndex === index) {
      setIsPlaying(false)
      setPlayingVideoIndex(null)
    }
    if (direction === 'right') {
      setLikedIndex(index)
      setTimeout(() => setLikedIndex(null), 800)
    }
  }

  const outOfFrame = (name: string, idx: number) => {
    if (currentIndexRef.current >= idx) {
      childRefs.current[idx].current.restoreCard()
    }
  }

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < submissions.length) {
      await childRefs.current[currentIndex].current.swipe(dir)
    }
  }

  const handleDislike = async (index: number) => {
    if (userId) {
      try {
        let response = await postApi.downvotePost(submissions[index]._id, userId);
        toast.success(response.message);
        setSubmissions((prevSubmissions) => {
          const newSubmissions = [...prevSubmissions];
          newSubmissions[index] = {
            ...newSubmissions[index],
            votes: newSubmissions[index].votes.filter(vote => vote !== userId)
          };
          return newSubmissions;
        });
      } catch (error) {
        toast.error("Failed to remove vote");
      }
    }
    else{
      toast.error("You havent logged in, log in to start voting")
      router.push("/")
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen z-0 bg-gradient-to-br from-gray-900 to-black p-4">
      <h1 className="text-5xl font-bold mb-8 text-white tracking-wider">LENSCAPE</h1>
      <div className="relative w-full max-w-sm h-[600px]">
        <AnimatePresence>
          {submissions.map((submission, index) => (
            index >= currentIndex && (
              <TinderCard
                ref={childRefs.current[index]}
                key={submission._id}
                onSwipe={(dir) => swiped(dir, submission.teamName, index)}
                onCardLeftScreen={() => outOfFrame(submission.teamName, index)}
                className="absolute w-full h-[560px]"
                swipeRequirementType="position"
                swipeThreshold={100}
                preventSwipe={['up', 'down']}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full cursor-grab active:cursor-grabbing"
                  style={{ touchAction: 'pan-x' }}
                >
                  <Card className={`overflow-hidden h-full shadow-xl rounded-xl bg-gray-800 border-gray-700 transition-all duration-300 ${likedIndex === index ? 'scale-95 opacity-80' : ''}`}>
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="relative flex-grow">
                        {submission.type.startsWith("image") ? (
                          <>
                            {imageLoadingStates[submission._id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                              </div>
                            )}
                            <Image
                              src={getOptimizedDriveUrl(submission.url)}
                              alt={`Submission by ${submission.teamName}`}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imageLoadingStates[submission._id] ? 'opacity-0' : 'opacity-100'
                              }`}
                              draggable="false"
                              width={500}
                              height={500}
                              onLoad={() => handleImageLoad(submission._id)}
                              priority={index === currentIndex}
                            />
                          </>
                        ) : (
                          <div className="relative w-full h-full">
                            <ReactPlayer
                              ref={videoRef}
                              url={submission.url}
                              width="100%"
                              height="100%"
                              className="w-full h-full object-cover"
                              loop
                              playing={isPlaying && playingVideoIndex === index}
                            />
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-white flex rounded-full gap-2 p-2 transition-opacity hover:bg-opacity-75">
                          <Heart className={`h-6 w-6 text-red-500 ${userId && submission.votes.includes(userId) ? 'fill-red-500' : ''}`}/>
                          <p className="text-red-600">{submission.votes.length}</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                          <h2 className="text-2xl font-semibold text-white">{submission.title}</h2>
                          <p className="text-lg text-white">{submission.domain}</p>
                          <p className="text-white">@{submission.teamName}</p>
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
                    {(lastDirection === 'right' && index === currentIndex + 1) || likedIndex === index ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full text-lg font-semibold shadow-lg"
                      >
                        Good
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </TinderCard>
            )
          ))}
        </AnimatePresence>
      </div>
      <div className="flex justify-center mt-8 space-x-6">
        {userId && submissions[currentIndex]?.votes.includes(userId) ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleDislike(currentIndex)}
            className="bg-transparent hover:bg-red-900 text-red-500 border-red-500 hover:border-red-600 transition-colors duration-200"
          >
            Dislike
            <ThumbsDown className="h-6 w-6 ml-2 transform -scale-x-100" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onClick={() => swipe('right')}
            disabled={!canSwipe}
            className="bg-transparent hover:bg-green-900 text-green-500 border-green-500 hover:border-green-600 transition-colors duration-200"
          >
            Like
            <Heart className="h-6 w-6 ml-2" />
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          onClick={() => swipe('left')}
          disabled={!canSwipe}
          className="bg-transparent hover:bg-blue-900 text-blue-500 border-blue-500 hover:border-blue-600"
        >
          Next
          <ChevronRight className="h-6 w-6 ml-2" />
        </Button>
      </div>
      <ToastContainer/>
    </div>
  )
}