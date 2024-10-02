"use client";
import React from "react";
import { ContainerScroll } from "../../components/ui/container-scroll-animation";
import Image from "next/image";

export default function HeroScrollDemo() {
  // Function to handle Google Authentication
  const handleGoogleAuth = () => {
    // Redirect to the backend Google OAuth route
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Spark your creativity with <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Lenscape
              </span>
            </h1>
          </>
        }
      >
        <Image
          src={`/linear.webp`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
      <button
        onClick={handleGoogleAuth} // Trigger Google OAuth on button click
        className="mt-4 mx-auto bg-black text-white px-4 py-2 rounded-lg"
      >
        Get Started
      </button>
    </div>
  );
}
