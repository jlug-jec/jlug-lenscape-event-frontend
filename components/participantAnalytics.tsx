"use client"

import { useState} from "react";
import Image from "next/legacy/image";
import { ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPostDialog, UploadDialog } from "./postDialogs";
import type { Post,UserPosts } from "../app/types/post";
import ImageModal from "./imageModel";
import React from 'react'
import ReactPlayer from 'react-player/lazy'

const categories = ['photography', 'videography', 'digital art'] as const;

function PostCard({ post, category,isTeamLeader ,teamName,teamId}: { post?: Post; category: string,isTeamLeader:boolean ,teamName:string,teamId:string}) {
  const [currentPost, setCurrentPost] = useState<Post | undefined>(post);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
  const handlePostUpdate = (title: string, url: string,type:string) => {
      setCurrentPost((currentPost: Post | undefined) => {
          return {
              ...currentPost!,
              title: title,
              url: url,
              type:type
             
          } as Post;
      });
  };

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader>
        <CardTitle className="text-lg capitalize text-neutral-300">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentPost ? (
          <div className="space-y-2">
            <div 
              className="relative w-full pt-[56.25%] cursor-pointer" 
              onClick={() => setIsModalOpen(true)}
            >
              {currentPost.type.startsWith("image") ? (
                <Image
                  src={currentPost.url}
                  alt="Sample Image"
                  className="rounded-md absolute inset-0"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="absolute inset-0">
                  <ReactPlayer
                    url={currentPost.url}
                    width="100%"
                    height="100%"
                    className="rounded-md"
                    loop={true}
                    controls={true}
                    
                  />
                </div>
              )}
            </div>
            <p className="text-center text-md text-slate-300">{currentPost.title}</p>
            <p className="text-center text-md text-slate-300">{currentPost.votes?.length} likes</p>

            <EditPostDialog
              post={currentPost}
              onPostUpdate={handlePostUpdate}
              isTeamLeader={isTeamLeader}
            />
          </div>
        ) : (
          <UploadDialog 
            category={category} 
            onPostUpdate={handlePostUpdate}  
            isTeamLeader={isTeamLeader} 
            teamName={teamName} 
            teamId={teamId} 
          />
        )}
      </CardContent>

      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        src={currentPost?.url ?? ""}
        alt={currentPost?.title ?? ""}
      
      />
    </Card>
  )
}




export default function ParticipantAnalytics({ userPosts, totalLikes,isTeamLeader }:{ userPosts: UserPosts ; totalLikes: number;isTeamLeader: boolean }) {
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center text-neutral-400">
          <ThumbsUp className="w-5 h-5 mr-2 " />
          Your Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{totalLikes}</p>
          <p className="text-gray-400">Total Likes</p>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((category) => {
            const post = userPosts.posts?.find(post => post.domain === category);
            return <PostCard key={post?._id} post={post} category={category}  isTeamLeader={isTeamLeader} teamName={userPosts.teamName} teamId={userPosts._id}/>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
