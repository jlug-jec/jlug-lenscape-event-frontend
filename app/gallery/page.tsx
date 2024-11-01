"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image'
import ReactPlayer from 'react-player'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThumbsUp, Loader2, Play, Filter, ArrowUpDown } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { postApi } from "../api/posts";
import { Post } from "../types/post";
import { getOptimizedDriveUrl } from "@/lib/utils";

export default function MediaGallery() {
  const [selectedItem, setSelectedItem] = useState<Post | null>(null)
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnlargedImageLoading, setIsEnlargedImageLoading] = useState(true);
  
  // New state for filtering and sorting
  const [sortBy, setSortBy] = useState<'votesDesc' | 'votesAsc'>('votesDesc');
  const [filterBy, setFilterBy] = useState<'all' | 'photography' | 'videography' | 'digitalArt'>('all');

  const getAllPosts = async () => {
    setIsLoading(true);
    try {
      const data = await postApi.getAllPosts()
      setPosts(data)
      setFilteredPosts(data)
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllPosts()
   
  }, []);

  // Filtering and sorting effect
  useEffect(() => {
    let result = [...posts];

    // Filter by type
    if (filterBy !== 'all') {
      result = result.filter(post => {
        switch(filterBy) {
          case 'photography':
            return post.domain==='photography';
          case 'videography':
            return post.domain==='videography';
          case 'digitalArt':
            return post.domain === 'digitalArt';
          default:
            return true;
        }
      });
    }

    // Sort by votes
    result.sort((a, b) => {
      return sortBy === 'votesDesc' 
        ? b.votes.length - a.votes.length 
        : a.votes.length - b.votes.length;
    });

    setFilteredPosts(result);
  }, [posts, sortBy, filterBy]);

  const handleItemClick = (item: Post) => {
    setSelectedItem(item)
    setIsEnlargedImageLoading(true);
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const handleEnlargedImageLoad = () => {
    setIsEnlargedImageLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Lenscape Media Gallery
        </h1>

        {/* Filtering and Sorting Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {/* Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
                <Filter className="mr-2 h-4 w-4" /> 
                {filterBy === 'all' ? 'All Types' : 
                 filterBy === 'photography' ? 'Photography' : 
                 filterBy === 'videography' ? 'Videography' : 
                 'digitalArt'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
              <DropdownMenuItem 
                onClick={() => setFilterBy('all')} 
                className="hover:bg-gray-700 cursor-pointer"
              >
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterBy('photography')} 
                className="hover:bg-gray-700 cursor-pointer"
              >
                Photography
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterBy('videography')} 
                className="hover:bg-gray-700 cursor-pointer"
              >
                Videography
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterBy('digitalArt')} 
                className="hover:bg-gray-700 cursor-pointer"
              >
                Digital Art
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Votes Sorting Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
                <ArrowUpDown className="mr-2 h-4 w-4" /> 
                {sortBy === 'votesDesc' ? 'Most Voted' : 'Least Voted'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
              <DropdownMenuItem 
                onClick={() => setSortBy('votesDesc')} 
                className="hover:bg-gray-700 cursor-pointer"
              >
                Most Voted
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('votesAsc')} 
                className="hover:bg-gray-700 cursor-pointer"
              >
                Least Voted
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array(20).fill(0).map((_, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <Skeleton className="w-full h-48 bg-gray-700" />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center p-3 bg-gray-800">
                    <Skeleton className="h-4 w-[100px] bg-gray-700" />
                    <Skeleton className="h-4 w-[50px] bg-gray-700" />
                  </CardFooter>
                </Card>
              ))
            : filteredPosts.map((item) => (
                <Card key={item._id} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => handleItemClick(item)}>
                  {!item.url.toLowerCase().includes('folder')  &&
                    <CardContent className="p-0 relative">
                    {item.type.startsWith('image') ? (
                      <>
                        <Image 
                          src={getOptimizedDriveUrl(item.url)} 
                          alt={item.title} 
                          width={300} 
                          height={200} 
                          className="w-full h-48 object-cover" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <ThumbsUp className="w-10 h-10 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="relative w-full h-48">
                        <ReactPlayer 
                          url={item.url} 
                          width="100%" 
                          height="100%" 
                          light={true}
                          playIcon={<Play className="text-white w-16 h-16" />}
                        />
                      </div>
                    )}
                  </CardContent> }
                
                  <CardFooter className="flex justify-between items-center p-3 bg-gray-800">
                    <div className="text-sm font-medium truncate text-gray-300">{item.title}</div>
                    <Badge variant="secondary" className="bg-purple-600 text-white">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {item.votes.length}
                    </Badge>
                  </CardFooter>
                </Card>
              ))
          }
        </div>

        {/* Rest of the code remains the same as the original component */}
        <Dialog open={!!selectedItem} onOpenChange={handleCloseModal}>
          {selectedItem && (
            <DialogContent className="max-w-4xl bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-purple-400">{selectedItem.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 relative rounded-lg overflow-hidden">
                {isEnlargedImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                  </div>
                )}
                {selectedItem.type.startsWith('image') ? (
                  <Image 
                    src={getOptimizedDriveUrl(selectedItem.url)} 
                    alt={selectedItem.title} 
                    width={800} 
                    height={600} 
                    className="w-full h-auto rounded-lg" 
                    onLoad={handleEnlargedImageLoad}
                  />
                ) : (
                  selectedItem.url.includes("drive.google.com") ? (
                    <div className="relative w-full h-96 bg-gray-800 flex items-center justify-center rounded-lg overflow-hidden">
                      <div className="text-center text-white">
                        <p className="mb-4">Only YouTube videos can be viewed here. To view this video, please click the link below:</p>
                        <a 
                          href={selectedItem.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          View on Google Drive
                        </a>
                      </div>
                    </div>
                  ) : (
                    <ReactPlayer 
                      url={selectedItem.url} 
                      width="100%" 
                      height={400} 
                      controls 
                      onReady={() => setIsEnlargedImageLoading(false)}
                      className="rounded-lg overflow-hidden"
                    />
                  ))}
              </div>
              <ScrollArea className="mt-4 h-40 rounded-md border border-gray-700 p-4">
                <div className="space-y-2 text-gray-300">
                  <p><strong className="text-purple-400">Domain:</strong> {selectedItem.domain}</p>
                  <p><strong className="text-purple-400">Team:</strong> {selectedItem.teamName}</p>
                  <p><strong className="text-purple-400">Votes:</strong> {selectedItem.votes.length}</p>
                </div>
              </ScrollArea>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  )
}