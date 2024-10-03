"use client"

import { useState, useEffect } from "react";
import Image from "next/legacy/image";
import { ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPostDialog, UploadDialog } from "./postDialogs";
import { toast } from "react-toastify";
import useUserStore from "@/store/useUserStore";

interface Post {
  id: string;
  title:string;
  category: 'photography' | 'videography' | 'digiatal art';
  url: string;
  likes: number;

}
interface TeamMember {
    _id: string;
    name: string;
    picture: string;
  }
  
  interface UserData {
    team?: {
      _id: string;
    };
    // Add other user properties as needed
  }
  

const categories = ['photography', 'videography', 'digital art'] as const;

function PostCard({ post, category }: { post?: Post; category: string }) {
  const [currentPost, setCurrentPost] = useState(post); 

  
  const handlePostUpdate = (title:string,url:string) => {
    setCurrentPost((currentPost)=>{
      return {
        ...currentPost,
        title:title,
        url:url
      }
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
            <div className="relative w-full h-40">
              {/* TODO: MAKES IT DYNAMIC TO SUPPORT BOTH IMAGE AND VIDEO URL */}
              <Image
                src={currentPost.url}  
                alt={category}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <p className="text-center text-md text-slate-300">{currentPost.title}</p>  
            <p className="text-center text-md text-slate-300">{currentPost.votes?.length} likes</p>

            
           

            <EditPostDialog
              post={currentPost}
              onPostUpdate={handlePostUpdate}
            />
          </div>
        ) : (
          <>
            <UploadDialog category={category}  onPostUpdate={handlePostUpdate}/>
          </>
        )}
      </CardContent>
    </Card>
  );
}


export default function ParticipantAnalytics() {
  const [userPosts, setUserPosts] = useState();
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { user,loadUser } = useUserStore();
  const [teamId, setTeamId] = useState<UserData | null>(null);

 
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.userId) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/participant/users/${user.userId}`);
        if (response.ok) {
          const result = await response.json();
          
          setTeamId(result.team._id);
        } else {
          toast.error("Failed to fetch post details. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    };

    fetchUserDetails();
  }, [user?.userId]);


  useEffect(() => {
    const fetchUserPosts = async () => {
    
      if (!teamId) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/team/${teamId}`);
        if (response.ok) {
          const fetchedPosts = await response.json();
          
          setUserPosts(fetchedPosts);

          //TODO : TOTAL LIKES FUNCTION

          // const totalLikes = fetchedPosts.reduce((sum, post) => sum + post.likes, 0);
          // setTotalLikes(totalLikes);
        } else {
          toast.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("An unexpected error occurred while fetching posts");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [teamId]);
  if (loading) {
    return <p>Loading...</p>;
  }

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
            const post = userPosts?.posts.find(post => post.domain === category);
            return <PostCard key={post?._id} post={post} category={category}  />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
