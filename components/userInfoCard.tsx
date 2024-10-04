"use client"
import Image from "next/legacy/image"
import { User, School, GroupIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserData } from "@/app/types/user"

export default function UserInfoCard({ userData: userData }: { userData: UserData }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
          <Image
            src={userData.picture || "/placeholder.svg"}
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold text-neutral-300">{userData?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-neutral-400">
        <div className="flex items-center text-neutral-400">
          <User className="w-5 h-5 mr-2" />
          <span>{userData?.branch}</span>
        </div>
        <div className="flex items-center ">
          <School className="w-5 h-5 mr-2" />
          <span>{userData?.collegeName}</span>
        </div>
        {userData?.team &&
       <div className="flex items-center">
       <GroupIcon className="w-5 h-5 mr-2" />
       <span>{userData.team?.teamName}</span>
     </div>
     } 
       
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-sm ${userData.isParticipant ? (userData.isTeamLeader ? 'bg-purple-500' : 'bg-green-500') : 'bg-blue-500'} text-white`}>
            {userData.isParticipant ? (userData.isTeamLeader ? 'Team Leader' : 'Team Member') : 'User'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
