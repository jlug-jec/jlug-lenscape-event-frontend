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
import { UserData,TeamMember } from "../types/user"
import { Post,UserPosts} from "../types/post"
import { useRouter } from "next/navigation"
import { getUserDetails } from "../api/userApi"
import { authenticatedFetch } from "@/lib/auth.utils"
import { Footer } from "@/components/footer"



export default function ProfilePage() {
  const {user,setUser } = useUserStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPosts, setUserPosts] = useState<UserPosts | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [teamMembers,setTeamMembers]=useState<TeamMember[]>([])
  const [pendingInvitations,setPendingInvitations]=useState<(string | null)[]>([])
  const [role,setRole]=useState<string>("User")
  const [isTeamLeader,setIsTeamLeader]=useState<boolean>(false)
  const router = useRouter();
  let jwtToken : string | null = '';
  let refreshToken : string | undefined = '';
const fetchUserData = async () => {
  try {
    if (!localStorage.getItem('_id')) {
      router.push('/');
    } else {
      // Get the tokens directly inside the function
      const jwtToken = localStorage.getItem('jwtToken');
      const refreshToken = localStorage.getItem('refreshToken') || undefined;

      if (!jwtToken) {
        toast.error('Token not found');
        return;
      }

      // Fetch user details and posts
      const incomingUserData = await getUserDetails(localStorage.getItem('_id')?.trim().replace(/"/g, ''), jwtToken, refreshToken);
        
      if (incomingUserData.isParticipant) {
        setRole('Participant');
      }

      if (incomingUserData) {
        
        setUserData(incomingUserData);
        
      }
      if(jwtToken && refreshToken){
        await fetchUserPosts(incomingUserData.team._id, jwtToken, refreshToken);
        await fetchTeamDetailsAndInvitations(incomingUserData.team._id, jwtToken, refreshToken);

      } 
      if (incomingUserData.status === 404) {
        toast.error('User not found, Please create your account');
        router.push('/');
      }

      if (incomingUserData.status == 401) {
        // Handle unauthorized access
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    setIsPageLoading(false);
  }
};


  useEffect(() => {
     jwtToken = localStorage.getItem('jwtToken');
     refreshToken = localStorage.getItem('refreshToken') || undefined; // Default to undefined if null
  }, [userData]);


  useEffect(() => {
    fetchUserData();
    if(user?.isOnboarded && user?.isParticipant) router.push('/profile');
  }, [user]);



const fetchUserPosts = async (teamId: string,jwtToken:string|null,refreshToken:string|undefined) => {
    try {
      const postsResponse = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/team/${teamId}`,
        {
          method: 'GET',
          requireAuth: true, // Ensure the fetch is authenticated
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'X-Refresh-Token': refreshToken || ''
          }
        }
      );
      
      if (postsResponse.ok) {
        const fetchedPosts = await postsResponse.json();
        localStorage.getItem('_id')==fetchedPosts.teamLeader?setIsTeamLeader(true):setIsTeamLeader(false);
        setUserPosts(fetchedPosts);
      } else {
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    }
  };

  const fetchTeamDetailsAndInvitations = async (teamId: string,jwtToken:string|null,refreshToken:string|undefined) => {
    if (!teamId) return;

    try {
      const response =  await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/participant/invitations/${teamId}`,
        {
          method: 'GET',
          requireAuth: true, // Ensure the fetch is authenticated
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'X-Refresh-Token': refreshToken || ''
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers);
        setPendingInvitations(data.invitations);
      } else {
        toast.error("Failed to fetch team details and invitations.");
      }
    } catch (error) {
      console.error("Error fetching team details and invitations:", error);
      toast.error("An unexpected error occurred while fetching data.");
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {isPageLoading? <ClipLoader color="#ffffff" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"  /> : 


        <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Info Section */}
          <div className="md:w-1/3">
            {userData && <UserInfoCard userData={userData} />}
          </div>
          {/* Posts and Liked Posts Section */}
          <div className="md:w-2/3 space-y-8">
            {role==="User"? (
              ""
              // <LockedPosts />
            ) : (
              <>
                {userData?.team?._id && <TeamMembersAndInvitations teamMembers={teamMembers} pendingInvitations={pendingInvitations} />}
                {userPosts && <ParticipantAnalytics userPosts={userPosts} totalLikes={totalLikes} isTeamLeader={isTeamLeader}/>}
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
