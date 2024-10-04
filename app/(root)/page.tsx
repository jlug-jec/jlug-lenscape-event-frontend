"use client";

import { useState, useEffect } from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import dynamic from "next/dynamic"; // Import dynamic
import { useRouter } from "next/navigation";
import lottie_animation from "@/public/lottie_animation.json";
import { FlipWords } from "@/components/ui/flip-words";
import { Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Dynamically import Lottie to prevent server-side rendering
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function HomePage() {
  const [isServerActive, setIsServerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false); // Flag to ensure client-side rendering
  const router = useRouter();

  // Check if the component is mounted on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleAuth = () => {
    const isOnboarded = localStorage.getItem("onboardedUser") === "true";
    const isParticipantLocalStorage =
      localStorage.getItem("isParticipant") === "true";

    if (isOnboarded && isParticipantLocalStorage) {
      router.push("/profile");
      return;
    } else if (isOnboarded && !isParticipantLocalStorage) {
      router.push("/countdown");
      return;
    } else {
      window.location.href = `${API_URL}/auth/google`;
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "HEAD",
      });

      if (response.status === 200) {
        setIsServerActive(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking server status:", error);
    }
  };

  useEffect(() => {
    // Check server status on mount
    checkServerStatus();
  }, []);

  if (!isClient || isLoading) {
    // Show loading animation until the component is mounted on the client
    const words = [
      "Loading the aperture",
      "Capturing the moment",
      "Focusing the lens",
      "Processing the image",
      "Creating the story",
      "Sharing the memory",
      "Shining my lens",
    ];
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 transition-all">
        <Lottie
          animationData={lottie_animation}
          loop={true}
          style={{ width: 300, height: 300 }}
        />
        <FlipWords words={words} className="text-4xl text-gray-400 mt-5" />
        <br />
      </div>
    );
  }

  return (
    <>
      <Header />
      <HeroParallax products={products} handleGoogleAuth={handleGoogleAuth} />
    </>
  );
}



const products = [
  {
    title: "Image 1",
    link: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    thumbnail: "/images/image_1.jpg",
  },
  {
    title: "Image 2",
    link: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    thumbnail: "/images/image_2.jpg",
  },
  {
    title: "Image 3",
    link: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    thumbnail: "/images/image_3.jpg",
  },
  {
    title: "Image 4",
    link: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    thumbnail: "/images/image_4.jpg",
  },
  {
    title: "Image 5",
    link: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    thumbnail: "/images/image_5.jpg",
  },
  {
    title: "Image 6",
    link: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    thumbnail: "/images/image_6.jpg",
  },
  {
    title: "Image 7",
    link: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94",
    thumbnail: "/images/image_7.jpg",
  },
  {
    title: "Image 8",
    link: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
  },
  {
    title: "Image 9",
    link: "https://images.unsplash.com/photo-1496196614460-48988a57fccf",
    thumbnail: "/images/image_8.jpg",
  },
  {
    title: "Image 10",
    link: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    thumbnail: "/images/image_9.jpg",
  },
  {
    title: "Image 11",
    link: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  },
  {
    title: "Image 12",
    link: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  },
  {
    title: "Image 13",
    link: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  },
  {
    title: "Image 14",
    link: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
  {
    title: "Image 15",
    link: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    thumbnail: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
  },
  {
    title: "Image 16",
    link: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94",
    thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94",
  },
  {
    title: "Image 17",
    link: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
  },
  {
    title: "Image 18",
    link: "https://images.unsplash.com/photo-1496196614460-48988a57fccf",
    thumbnail: "https://images.unsplash.com/photo-1496196614460-48988a57fccf",
  },
];

const Header = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-blue-900 to-black">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-8 h-8 bg-blue-500 rounded-full blur-lg animate-pulse opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-8 h-8 bg-purple-500 rounded-full blur-lg animate-pulse opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center justify-center px-3 py-1 bg-red-500 bg-opacity-20 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-2" />
              <span className="text-red-300 text-sm font-semibold">LIVE</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
              LENSCAPE 2024
            </h1>
          </div>

          {/* Center section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-sm sm:text-base font-medium">Event in Progress</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
