"use client"
import UserInfoCard from "@/components/userInfoCard"
import LikedPosts from "@/components/likedPosts"
import ParticipantAnalytics from "@/components/participantAnalytics"
import LockedPosts from "@/components/lockedPosts"
import TeamMembersAndInvitations from "@/components/teamMembersAndInvitation"
import { ToastContainer } from "react-toastify"
import useUserStore from "@/store/useUserStore"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { ClipLoader } from "react-spinners"
import { UserData } from "../types/user"
import { Post } from "../types/post"
import { useRouter } from "next/navigation"

interface Team {
  posts: Post[];
  teamName: string;
}
export default function ProfilePage() {
  const { user, loadUser } = useUserStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPosts, setUserPosts] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [role,setRole]=useState<string>("User")
  const router = useRouter();
  useEffect(() => {

    loadUser();
    
  }, [loadUser]);

  useEffect(() => {
    const fetchUserDetails = async () => {

      if (!user?.userId) return ;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/participant/users/${user.userId}`);
        if (response.ok) {
          const result = await response.json();
          if(result.isParticipant){
            setRole("Participant")
          }
          setUserData(result);
          // Fetch user posts based on team ID
          const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/team/${result.team._id}`);
          if (postsResponse.ok) {
            const fetchedPosts = await postsResponse.json();
            console.log(fetchedPosts)
            setUserPosts(fetchedPosts);
            // Calculate total likes
            // const likes = fetchedPosts.reduce((sum, post) => sum + post.likes, 0);
            // setTotalLikes(likes);
          } else {
            toast.error("Failed to fetch posts");
          }
        } else {
          toast.error("Failed to fetch user details. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {loading? <ClipLoader color="#ffffff" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"  /> : 


        <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Info Section */}
          <div className="md:w-1/3">
            {userData && <UserInfoCard userData={userData} />}
          </div>
          {/* Posts and Liked Posts Section */}
          <div className="md:w-2/3 space-y-8">
            {role==="User"? (
              <LockedPosts />
            ) : (
              <>
                {userData?.team?._id && <TeamMembersAndInvitations teamId={userData.team._id} />}
                {userPosts && <ParticipantAnalytics userPosts={userPosts.posts} totalLikes={totalLikes} />}
              </>
            )}
            <LikedPosts />
            <ToastContainer />
          </div>
        </div>
      </div>
      }
    
    </div>
  )
}
