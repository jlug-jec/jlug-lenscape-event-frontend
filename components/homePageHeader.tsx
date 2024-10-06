import { Sparkles } from "lucide-react";

export const Header = () => {
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
  