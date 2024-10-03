// "use client";
// import React from "react";
// import { ContainerScroll } from "../../components/ui/container-scroll-animation";
// import Image from "next/image";

// export default function HeroScrollDemo() {
//   // Function to handle Google Authentication
//   const handleGoogleAuth = () => {
//     // Redirect to the backend Google OAuth route
//     window.location.href = "http://localhost:8000/auth/google";
//   };

//   return (
//     <div className="flex flex-col overflow-hidden">
//       <ContainerScroll
//         titleComponent={
//           <>
//             <h1 className="text-4xl font-semibold text-black dark:text-white">
//               Spark your creativity with <br />
//               <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
//                 Lenscape
//               </span>
//             </h1>
//           </>
//         }
//       >
//         <Image
//           src={`/linear.webp`}
//           alt="hero"
//           height={720}
//           width={1400}
//           className="mx-auto rounded-2xl object-cover h-full object-left-top"
//           draggable={false}
//         />
//       </ContainerScroll>
//       <button
//         onClick={handleGoogleAuth} // Trigger Google OAuth on button click
//         className="mt-4 mx-auto bg-black text-white px-4 py-2 rounded-lg"
//       >
//         Get Started
//       </button>
//     </div>
//   );
// }
"use client"

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from "next/legacy/image"
import router from 'next/router'

const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState<number>(0)

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset)
    }
    window.addEventListener('scroll', updatePosition)
    updatePosition()
    return () => window.removeEventListener('scroll', updatePosition)
  }, [])

  return scrollPosition
}



export default function Homepage() {
    // Function to handle Google Authentication
   
  
  const handleGoogleAuth = () => {
    const isOnboarded=localStorage.getItem('onboardedUser');
    const isParticipantLocalStorage=localStorage.getItem('isParticipant');
    if (isOnboarded && isParticipantLocalStorage){
      router.push('/profile');
      return
    }
    else{
      window.location.href = "http://localhost:8000/auth/google";
    }
    // Redirect to the backend Google OAuth route
    
  };

  const controls = useAnimation()
  const [ref, inView] = useInView()
  const scrollPosition = useScrollPosition()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
    'https://images.unsplash.com/photo-1490730141103-6cac27aaab94',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b',
    'https://images.unsplash.com/photo-1496196614460-48988a57fccf',
  ]

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Images */}
      <div
        className="absolute inset-0 grid grid-cols-4 h-[180%] gap-4 transform -rotate-45 scale-[2] origin-center"
        style={{
          transform: `rotate(-45deg) scale(1.3) translateY(${scrollPosition * 0.5}px)`,
        }}
      >
        {images.map((src, index) => (
          <motion.div
            key={index}
            ref={ref}
            animate={controls}
            initial="hidden"
            variants={{
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: index * 0.1 } },
              hidden: { opacity: 0, scale: 0.8 },
            }}
            className="relative overflow-hidden rounded-lg shadow-lg h-60"
          >
            <Image
              src={src}
              alt={`Landscape ${index + 1}`}
              layout='fill'
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              quality={75}
            />
          </motion.div>
        ))}
      </div>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-60"></div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl lg:max-w-7xl mx-auto mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 shadow-text">
            Your lens captures what words can&apos;t share your story, one frame at a time
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 shadow-text">
            &quot;Every picture tells a story. What&apos;s yours?&quot;
          </p>
          <motion.button
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 1.05 }}
            className="px-8 py-3 bg-white text-gray-800 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors duration-300"
            onClick={handleGoogleAuth}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        .shadow-text {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}