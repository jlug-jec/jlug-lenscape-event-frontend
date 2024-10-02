import UserInfoCard from "@/components/userInfoCard"
import LikedPosts from "@/components/likedPosts"
import ParticipantAnalytics from "@/components/participantAnalytics"
import LockedPosts from "@/components/lockedPosts"
import TeamMembersAndInvitations from "@/components/teamMembersAndInvitation"
import { ToastContainer } from "react-toastify"

interface ProfilePageProps {
  role: 'User' | 'Participant';
}

export default function ProfilePage({ role }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Info Section */}
          <div className="md:w-1/3">
            <UserInfoCard />
          </div>

          {/* Posts and Liked Posts Section */}
          <div className="md:w-2/3 space-y-8">
            {role === 'User' ? <LockedPosts /> : <ParticipantAnalytics />}
            <LikedPosts />
            {/* New Team Members and Invitations Section */}
            <TeamMembersAndInvitations />
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  )
}