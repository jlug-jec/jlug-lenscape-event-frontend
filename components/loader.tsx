import { FlipWords } from "@/components/ui/flip-words";
import { sentences } from "@/lib/constants";
import lottie_animation from "@/public/lottie_animation.json";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const Loader:React.FC=()=>{
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 transition-all">
          <Lottie
            animationData={lottie_animation}
            loop={true}
            style={{ width: 300, height: 300 }}
          />
          <FlipWords words={sentences} className="text-4xl text-gray-400 mt-5" />
          <br />
        </div>
      );
}