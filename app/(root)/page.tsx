"use client";

import { useState, useEffect } from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import {Header} from "@/components/homePageHeader";
import {products} from "@/lib/constants";
import { checkServerStatus,handleGoogleAuth } from "../api/checkServer";
import { Loader } from "@/components/loader";
import { toast } from "react-toastify";
import { Footer } from "@/components/footer";


export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);




  useEffect(() => {
    checkServerStatus(setIsLoading);
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
   return <Loader />
  }

  return (
    <>
      <Header />
      <HeroParallax products={products} handleGoogleAuth={handleGoogleAuth} />
      <Footer />
   
    </>
  );
}

