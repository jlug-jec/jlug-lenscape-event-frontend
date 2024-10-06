"use client";

import { useState, useEffect } from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import {Header} from "@/components/homePageHeader";
import {products} from "@/lib/constants";
import { checkServerStatus,handleGoogleAuth } from "../api/checkServer";
import { Loader } from "@/components/loader";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Footer } from "@/components/footer";
import FAQPopup from "@/components/faq";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const searchParams=useSearchParams()
  const error=searchParams.get("error")



  useEffect(() => {
    setIsClient(true);
    if(error=="session_expired"){
      toast.warn("session expired, Please Login Again")
      return
    }
  }, []);

  useEffect(() => {
    checkServerStatus(setIsLoading);
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

