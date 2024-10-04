"use client"

import { useState} from "react";
import Image from "next/legacy/image";
import { ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPostDialog, UploadDialog } from "./postDialogs";
import type { Post } from "../app/types/post";
import ImageModal from "./imageModel";

const categories = ['photography', 'videography', 'digital art'] as const;

function PostCard({ post, category }: { post?: Post; category: string }) {
  const [currentPost, setCurrentPost] = useState<Post | undefined>(post);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to manage modal visibility

  const handlePostUpdate = (title: string, url: string) => {
      console.log(title, url);
      setCurrentPost((currentPost: Post | undefined) => {
          return {
              ...currentPost!,
              title: title,
              url: url,
          } as Post;
      });
  };

  return (
      <Card className="bg-gray-700 border-gray-600 ">
          <CardHeader>
              <CardTitle className="text-lg capitalize text-neutral-300">{category}</CardTitle>
          </CardHeader>
          <CardContent>
              {currentPost ? (
                  <div className="space-y-2">
                      <div 
                          className="relative w-full h-40 cursor-pointer" 
                          onClick={() => setIsModalOpen(true)} // Open modal on image or video click
                      >
                          <p className="text-neutral-800">Images and previews will be available shortly¯</p>
                          {/* {currentPost.type === 'image' ? (
                              <Image
                                  src={currentPost.url}
                                  alt="Sample Image"
                                  className="rounded-md"
                                  layout="fill"
                                  objectFit="cover"
                              />
                          ) : (
                              <video className="rounded-md w-full h-full" controls>
                                  <source src={currentPost.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                              </video>
                          )} */}
                      </div>
                      <p className="text-center text-md text-slate-300">{currentPost.title}</p>
                      <p className="text-center text-md text-slate-300">{currentPost.votes?.length} likes</p>

                      <EditPostDialog
                          post={currentPost}
                          onPostUpdate={handlePostUpdate}
                      />
                  </div>
              ) : (
                  <UploadDialog category={category} onPostUpdate={handlePostUpdate} />
              )}
          </CardContent>

          {/* Modal for enlarged image or video */}
          <ImageModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              src={currentPost?.url ?? ""}  // Use currentPost URL for modal, fallback to empty string if undefined
              alt={currentPost?.title??""} // Optional: Use title for alt text
          />
      </Card>
  );
}




export default function ParticipantAnalytics({ userPosts, totalLikes }:{ userPosts:  Post[] | null ; totalLikes: number }) {
  console.log(userPosts);
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
            const post = userPosts?.find(post => post.domain === category);
            return <PostCard key={post?._id} post={post} category={category} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
