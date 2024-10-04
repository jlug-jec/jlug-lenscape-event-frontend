"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";


export const HeroParallax = ({
  products, handleGoogleAuth
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[],
  handleGoogleAuth: () => void
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );

  const rowAnimationFirst = {
    x: [-20, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 50,
        ease: "linear",
      },
    },
  };

  const rowAnimationSecond = {
    x: [-1000, 20],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 50,
        ease: "linear",
      },
    },
  };
  return (
    <div
      ref={ref}
      className="h-[300vh] py-10 bg-black  overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
     
      <CallToAction handleGoogleAuth={handleGoogleAuth} />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      
      >
        <motion.div 
        animate={rowAnimationFirst}
        className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div 
        animate={rowAnimationSecond}
        className="flex flex-row  mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div 
        animate={{ rotateX: 0, rotateZ: 0, translateY: 0, opacity: 1 }}
        className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};




export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -10,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link
        href={product.link}
        className="block group-hover/product:shadow-2xl "
      >
        <Image
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
          priority={true}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};

import { Camera, Sparkles } from 'lucide-react';
import React from "react";

export const CallToAction = ({ handleGoogleAuth }: { handleGoogleAuth: () => void }) => {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0  z-0" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto text-center">
        {/* Decorative camera icon */}
        <div className="flex items-center justify-center gap-4">

        {/* Pre-title badge */}
        <div className="inline-flex items-center justify-center px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-white/90 text-sm font-medium">Share Your Vision</span>
        </div>
        <div className="mb-8 inline-block">
          <div className="relative">
            <Camera className="w-12 h-12 text-white/80 animate-pulse" />
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-ping" />
          </div>
        </div>
        </div>
       

        {/* Main heading with gradient and animation */}
        <h1 className="relative mb-6 mx-auto max-w-4xl">
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold 
                         text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white
                         leading-tight tracking-tight">
            Your lens captures what words can&apos;t share your story, one frame at a time
          </span>
        </h1>

        {/* Subtitle with glowing effect */}
        <p className="mb-12 text-lg sm:text-xl md:text-2xl text-blue-100/90 max-w-2xl mx-auto
                     leading-relaxed font-medium">
          &quot;Every picture tells a story. What&apos;s yours?&quot;
        </p>

        {/* CTA button group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGoogleAuth}
            className="group relative px-8 py-4 bg-white hover:bg-opacity-95 text-gray-900 
                     rounded-full text-lg font-semibold transition-all duration-300
                     hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[0.98]
                     active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/0 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
            <span className="relative flex items-center justify-center gap-2">
              Get Started
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            </span>
          </button>
          
          {/* <a href="#learn-more" className="text-white/80 hover:text-white font-medium 
                                         transition-colors duration-300 flex items-center gap-2">
            Learn more
            <span className="text-lg">→</span>
          </a> */}
        </div>

        {/* Optional: Decorative elements */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 mb-8">
          <div className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};