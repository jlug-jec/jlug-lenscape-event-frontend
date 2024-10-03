"use client"
import Image from "next/legacy/image"
import { User, School, GroupIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useUserStore from "@/store/useUserStore"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

interface UserData {
  branch?: string;
  collegeName?: string;
  isParticipant?: boolean;
  isTeamLeader?: boolean;
  team?: {
    teamName?: string;
  };
}

export default function UserInfoCard() {
  const { user, loadUser } = useUserStore();
  const [userData, setUserData] = useState<UserData>({});

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/participant/users/${user.userId}`);
          if (response.ok) {
            const result = await response.json();
            setUserData(result);

          } else {
            toast.error("Failed to fetch user details. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("An unexpected error occurred. Please try again.");
        }
      };
      fetchUserDetails();
    }
  }, [user]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
          <Image
            src={user?.picture || "/placeholder.svg"}
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-neutral-300">{user?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-neutral-400">
        <div className="flex items-center text-neutral-400">
          <User className="w-5 h-5 mr-2" />
          <span>{userData.branch}</span>
        </div>
        <div className="flex items-center ">
          <School className="w-5 h-5 mr-2" />
          <span>{userData.collegeName}</span>
          
        </div>
        <div className="flex items-center">
          <GroupIcon className="w-5 h-5 mr-2" />
          <span>{userData?.team?.teamName}</span>
          
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-sm ${userData.isParticipant ? (userData.isTeamLeader ? 'bg-purple-500' : 'bg-green-500') : 'bg-blue-500'} text-white`}>
            {userData.isParticipant ? (userData.isTeamLeader ? 'Team Leader' : 'Team Member') : 'User'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}