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
  const {user,setUser } = useUserStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPosts, setUserPosts] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [role,setRole]=useState<string>("User")
  const router = useRouter();

    // Load user from localStorage
    useEffect(() => {
      const onboardedUser = localStorage.getItem('onboardedUser') === 'true';
      if (!onboardedUser) {
        // Case 1: No onboarded user
        router.push('/');
        return;
      }
      const loadUserFromStorage = () => {
        try {
          const storedUser = localStorage.getItem('user');

          if (!storedUser) {
            // Case 2: No user in localStorage
            router.push('/');
            return;
          }
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error loading user from storage:', error);
          clearUserData();
          router.push('/');
        }
      };
  
      loadUserFromStorage();
    }, [router]);
  
    // Fetch user details when user is loaded
    useEffect(() => {
      const fetchUserDetails = async () => {
        if (!user?.userId) {
          setLoading(false);
          return;
        }
  
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/participant/users/${user.userId}`
          );
  
          if (response.ok) {
            // Case 1: Valid user, normal flow
            const result = await response.json();
            setUserData(result);
  
            if (result.isParticipant) {
              setRole('Participant');
              await fetchUserPosts(result.team._id);
            }
          } else if (response.status === 404) {
            // Case 3: Invalid user ID
            clearUserData();
            toast.error('User not found, Please create your account');
            router.push('/');
          } else {
            toast.error('Failed to fetch user details. Please try again.');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          toast.error('An unexpected error occurred. Please try again.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserDetails();
    }, [user, router]);
  const fetchUserPosts = async (teamId: string) => {
    try {
      const postsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/team/${teamId}`
      );
      
      if (postsResponse.ok) {
        const fetchedPosts = await postsResponse.json();
        setUserPosts(fetchedPosts);
      } else {
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    }
  };

  const clearUserData = () => {
    localStorage.removeItem('onboardedUser');
    localStorage.removeItem('isParticipant');
    localStorage.removeItem('user');
    setUserData(null);
  };

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
